'use client';

import { useState, useEffect } from 'react';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface MessageModalProps {
    serviceId: string;
    sellerId: string;
    serviceTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function MessageModal({
    serviceId,
    sellerId,
    serviceTitle,
    isOpen,
    onClose,
    defaultText = ''
}: MessageModalProps & { defaultText?: string }) {
    const [content, setContent] = useState(defaultText);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (isOpen && defaultText) {
            setContent(defaultText);
        }
    }, [isOpen, defaultText]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            if (user.id === sellerId) {
                setError('No podés enviarte mensajes a vos mismo.');
                setLoading(false);
                return;
            }

            // Normalize participants to ensure unique conversion find/create
            const [p1, p2] = [user.id, sellerId].sort();

            // 1. Get or create conversation (using correct schema p1/p2)
            let conversationId;

            const { data: existingConv } = await supabase
                .from('conversations')
                .select('id')
                .eq('participant1_id', p1)
                .eq('participant2_id', p2)
                .single();

            if (existingConv) {
                conversationId = existingConv.id;
            } else {
                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert({
                        participant1_id: p1,
                        participant2_id: p2
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                conversationId = newConv.id;
            }

            // 2. Insert message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: content.trim()
                });

            if (msgError) throw msgError;

            // Show success state
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setContent('');
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error('Error sending message:', err);
            const message = err.message || 'Error al enviar el mensaje.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 shadow-2xl animate-in zoom-in-95 max-w-sm w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <Send size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 text-center">¡Mensaje Enviado!</h3>
                    <p className="text-slate-500 text-center text-sm font-medium">El prestador te responderá pronto.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`at-card w-full max-w-lg p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-300`}>
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg leading-tight">Enviar Mensaje</h3>
                            <p className="text-xs text-indigo-100 font-medium line-clamp-1">{serviceTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tu mensaje</label>
                        <textarea
                            autoFocus
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Escribí tu consulta aquí..."
                            className="w-full h-40 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all outline-none resize-none text-slate-700 font-medium"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-12 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="btn-primary px-8 h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Enviar</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
