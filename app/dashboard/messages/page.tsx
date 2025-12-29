'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Search, MessageSquare, User, Send, CheckCircle2,
    ArrowLeft, Loader2, Clock, Inbox, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MessagesPage() {
    const supabase = createClient();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const selectedIdRef = useRef<string | null>(null);

    useEffect(() => {
        selectedIdRef.current = selectedId;
    }, [selectedId]);

    useEffect(() => {
        async function initUserAndConversations() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                fetchConversations(user.id);
            }
        }
        initUserAndConversations();
    }, []);

    useEffect(() => {
        if (!user) return;

        console.log('--- Subscribing to messages for user:', user.id);

        const channel = supabase
            .channel(`realtime:messages:${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                const newMsg = payload.new;
                console.log('--- Real-time message INSERT payload:', newMsg);

                // 1. Refresh sidebar for everyone
                fetchConversations(user.id);

                // 2. If it's the active chat, update the window
                if (selectedIdRef.current === newMsg.conversation_id) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    setTimeout(scrollToBottom, 50);
                    markAsRead(newMsg.conversation_id);
                }
            })
            .subscribe((status) => {
                console.log('--- Subscription status:', status);
            });

        return () => {
            console.log('--- Cleaning up subscription');
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Initial fetch when changing chat
    useEffect(() => {
        if (!selectedId) return;
        fetchMessages(selectedId);
        markAsRead(selectedId);
    }, [selectedId]);

    const markAsRead = async (id: string) => {
        if (!user) return;
        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', id)
            .neq('sender_id', user.id)
            .eq('is_read', false);
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .neq('sender_id', user.id)
            .eq('is_read', false);

        if (!error) {
            fetchConversations(user.id);
        }
    };

    const fetchConversations = async (userId: string) => {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                buyer:buyer_id(full_name),
                seller:seller_id(full_name),
                service:service_id(title),
                messages(content, created_at, is_read, sender_id)
            `)
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (data) {
            // Processing to get the last message correctly
            const processed = data.map(c => ({
                ...c,
                last_msg: c.messages?.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0]
            }));
            setConversations(processed);
        }
        setLoading(false);
    };

    const fetchMessages = async (id: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });
        if (data) setMessages(data);
        setTimeout(scrollToBottom, 100);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedId || !user) return;

        setSending(true);
        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: selectedId,
                sender_id: user.id,
                content: newMessage.trim()
            });

        if (!error) {
            setNewMessage('');
            // Optional: update local conversation list to sync last message
            fetchConversations(user.id);
        }
        setSending(false);
    };

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const selectedConv = conversations.find(c => c.id === selectedId);
    const otherMemberName = selectedConv
        ? (selectedConv.buyer_id === user?.id ? selectedConv.seller?.full_name : selectedConv.buyer?.full_name)
        : '';

    if (loading) return (
        <div className="h-[calc(100vh-140px)] flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 text-indigo-200 animate-spin" />
        </div>
    );

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-4 pb-12">
            <div className="max-w-[1240px] mx-auto px-6 h-[calc(100vh-140px)]">
                <div className="at-card p-0 border-none h-full flex overflow-hidden shadow-2xl shadow-indigo-100/50 bg-white">

                    {/* Sidebar / List */}
                    <aside className={`w-full md:w-[380px] border-r border-slate-100 flex flex-col bg-white ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-6 border-b border-slate-50 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mensajes</h2>
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Marcar todo como leído
                                </button>
                            </div>
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar chat..."
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto scrollbar-hide">
                            {conversations.length > 0 ? (
                                conversations.map((conv) => {
                                    const otherName = conv.buyer_id === user?.id ? conv.seller?.full_name : conv.buyer?.full_name;
                                    const isSelected = selectedId === conv.id;
                                    const hasUnread = conv.messages?.some((m: any) => !m.is_read && m.sender_id !== user?.id);

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedId(conv.id)}
                                            className={`w-full p-6 text-left border-b border-slate-50 transition-all hover:bg-slate-50 flex items-center gap-4 ${isSelected ? 'bg-indigo-50/50 border-r-4 border-r-indigo-600' : ''}`}
                                        >
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm flex-shrink-0 relative">
                                                <User size={24} />
                                                {hasUnread && !isSelected && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-grow min-w-0 pr-2">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <p className="font-black text-slate-900 truncate leading-tight">{otherName}</p>
                                                    {conv.last_msg && (
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {formatDistanceToNow(new Date(conv.last_msg.created_at), { addSuffix: false, locale: es })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 truncate">
                                                    {conv.service?.title}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate font-medium">
                                                    {conv.last_msg?.content || 'Iniciaste una conversación'}
                                                </p>
                                            </div>
                                            {!isSelected && <ChevronRight size={14} className="text-slate-300" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                        <Inbox size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">No tenés conversaciones activas</p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Chat Area */}
                    <main className={`flex-grow flex flex-col bg-slate-50/30 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                        {selectedId ? (
                            <>
                                {/* Header */}
                                <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedId(null)}
                                            className="md:hidden p-2 bg-slate-50 rounded-xl text-slate-400"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 leading-none">{otherMemberName}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En línea</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Servicio relacionado</p>
                                        <p className="text-xs font-bold text-indigo-900 truncate max-w-[200px]">{selectedConv?.service?.title}</p>
                                    </div>
                                </header>

                                {/* Messages View */}
                                <div
                                    ref={scrollContainerRef}
                                    className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide"
                                >
                                    {messages.map((msg) => {
                                        const isMine = msg.sender_id === user?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                                            >
                                                <div className={`max-w-[75%] space-y-1`}>
                                                    <div className={`p-4 rounded-2xl font-medium text-sm shadow-sm ${isMine
                                                        ? 'bg-indigo-600 text-white rounded-tr-none border-none'
                                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        <Clock size={10} />
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMine && <CheckCircle2 size={10} className="text-indigo-400 ml-1" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Input Area */}
                                <footer className="p-6 bg-white border-t border-slate-100">
                                    <form onSubmit={sendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Escribí tu mensaje..."
                                            className="flex-grow bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                        />
                                        <button
                                            disabled={sending || !newMessage.trim()}
                                            className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                        </button>
                                    </form>
                                </footer>
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center bg-slate-50/20">
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-indigo-100/30 flex items-center justify-center mx-auto text-indigo-100">
                                        <MessageSquare size={48} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">Seleccioná una conversación</p>
                                        <p className="text-sm font-medium text-slate-400">Tus mensajes privados aparecerán acá.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
