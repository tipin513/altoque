'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Send, MoreVertical, Phone, Video, Image as ImageIcon, Paperclip, ArrowLeft, MessageSquare, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Types
type Profile = {
    id: string;
    full_name: string;
    avatar_url: string | null;
    email: string;
};

type Conversation = {
    id: string;
    participant1_id: string;
    participant2_id: string;
    last_message_at: string;
    other_user: Profile;
    last_message?: string;
};

type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
};

export default function MessagesPage() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const searchParams = useSearchParams();


    // Refs for scrolling
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUserAndConversations();
    }, []);

    useEffect(() => {
        if (activeConvId) {
            fetchMessages(activeConvId);
            subscribeToMessages(activeConvId);
        }
    }, [activeConvId]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, activeConvId]);

    const fetchUserAndConversations = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            // Fetch conversations where user is participant
            const { data: convs, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    p1:profiles!participant1_id(*),
                    p2:profiles!participant2_id(*)
                `)
                .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            // Transform data to get "other user" easily
            const formattedConvs = convs.map((c: any) => {
                const otherUser = c.participant1_id === user.id ? c.p2 : c.p1;
                return {
                    ...c,
                    other_user: otherUser
                };
            });

            setConversations(formattedConvs);

            // Allow selecting conversation via URL param ?chat=ID
            const chatIdFromUrl = searchParams.get('chat');
            if (chatIdFromUrl) {
                const exists = formattedConvs.find((c: any) => c.id === chatIdFromUrl);
                if (exists) {
                    setActiveConvId(chatIdFromUrl);
                }
            } else if (formattedConvs.length > 0 && !activeConvId) {
                // Optional: Auto-select first chat
                // setActiveConvId(formattedConvs[0].id);
            }

        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (convId: string) => {
        if (!user) return;

        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', convId)
                .neq('sender_id', user.id)
                .eq('is_read', false);

            // Optimistic update
            setMessages(prev => prev.map(m =>
                (m.conversation_id === convId && m.sender_id !== user.id && !m.is_read)
                    ? { ...m, is_read: true }
                    : m
            ));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            // Update all unread messages sent by others
            await supabase
                .from('messages')
                .update({ is_read: true })
                .neq('sender_id', user.id)
                .eq('is_read', false);

            // Fetch conversations again to refresh UI/Badges if needed (though subscriptions handle some)
            fetchUserAndConversations();

            // Also update current view if active
            if (activeConvId) {
                setMessages(prev => prev.map(m =>
                    (m.sender_id !== user.id && !m.is_read)
                        ? { ...m, is_read: true }
                        : m
                ));
            }
        } catch (err) {
            console.error('Error marking all as read', err);
        }
    };

    const fetchMessages = async (convId: string) => {
        setLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);

            // Mark as read immediately when loading
            markAsRead(convId);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const subscribeToMessages = (convId: string) => {
        const channel = supabase
            .channel(`chat:${convId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${convId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);

                    // If it's from the other person and we are looking at it, mark read
                    if (newMsg.sender_id !== user?.id) {
                        markAsRead(convId);
                    }

                    // Update conversation list last message time
                    setConversations(prev => {
                        const updated = prev.map(c =>
                            c.id === convId ? { ...c, last_message_at: newMsg.created_at } : c
                        );
                        return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    // Global subscription for sidebar updates (new messages in ANY chat)
    useEffect(() => {
        if (!user) return;

        const globalChannel = supabase
            .channel(`global-messages-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                async (payload) => {
                    const newMsg = payload.new as Message;

                    // We need to check if this message belongs to a conversation we are part of
                    // Since RLS policies might already filter, we trust the payload but verify conversation logic

                    setConversations(prev => {
                        // Check if conversation exists in list
                        const exists = prev.find(c => c.id === newMsg.conversation_id);

                        if (exists) {
                            // Update existing conversation
                            const updated = prev.map(c =>
                                c.id === newMsg.conversation_id
                                    ? { ...c, last_message_at: newMsg.created_at }
                                    : c
                            );
                            return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
                        } else {
                            // New conversation? We might need to fetch it or just ignore until refresh
                            // For robustness, let's trigger a refetch of conversations
                            fetchUserAndConversations();
                            return prev;
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(globalChannel);
        };
    }, [user]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvId || !user) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: activeConvId,
                    sender_id: user.id,
                    content: content
                });

            if (error) throw error;
            // Subscription will handle adding to UI
        } catch (error) {
            console.error('Error sending message:', error);
            alert('No se pudo enviar el mensaje');
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConvId);

    if (loading) return <div className="p-12 text-center text-slate-500">Cargando chats...</div>;

    return (
        <div className="flex-1 h-full bg-white md:rounded-[32px] md:border md:border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar (List) */}
            <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-50 space-y-4">
                    <h2 className="text-xl font-black text-slate-900">Mensajes</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                        <CheckCheck size={14} />
                        Marcar todos como leídos
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <p className="text-slate-400 text-sm">No tenés mensajes todavía.</p>
                            <p className="text-slate-300 text-xs mt-2">Contactá prestadores desde sus perfiles.</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConvId(conv.id)}
                                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${activeConvId === conv.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                        {conv.other_user.avatar_url ? (
                                            <img src={conv.other_user.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
                                                {conv.other_user.full_name[0]}
                                            </div>
                                        )}
                                    </div>
                                    {/* Simplified presence indicator logic possible here if real-time presence needed */}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-sm font-bold truncate ${activeConvId === conv.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                                            {conv.other_user.full_name}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                                            {format(new Date(conv.last_message_at), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${activeConvId === conv.id ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                                        Ver conversación...
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#f8fafc] ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                {activeConvId && activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveConvId(null)}
                                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                    {activeConversation.other_user.avatar_url ? (
                                        <img src={activeConversation.other_user.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                            {activeConversation.other_user.full_name[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{activeConversation.other_user.full_name}</h3>
                                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> En línea
                                    </p>
                                </div>
                            </div>
                            {/* Simplified Header Actions */}
                        </div>

                        {/* Messages Feed */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                        >
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMe
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                <p className="text-[10px]">
                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                </p>
                                                {isMe && (
                                                    <CheckCheck size={14} className={msg.is_read ? 'text-indigo-300' : 'text-indigo-400/50'} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form onSubmit={sendMessage} className="flex gap-2 items-end bg-slate-50 p-2 rounded-[24px] border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                                <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-white transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribí tu mensaje..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 resize-none py-3 max-h-32"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-200"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Tus Mensajes</h3>
                        <p className="max-w-xs mx-auto">Seleccioná una conversación de la izquierda o iniciá un nuevo chat desde un perfil.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
