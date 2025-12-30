'use client';

import { useState } from 'react';
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

export default function MessageModal({ serviceId, sellerId, serviceTitle, isOpen, onClose }: MessageModalProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

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

            // 1. Get or create conversation
            const { data: conversation, error: convError } = await supabase
                .from('conversations')
                .upsert({
                    service_id: serviceId,
                    buyer_id: user.id,
                    seller_id: sellerId
                }, { onConflict: 'service_id, buyer_id, seller_id' })
                .select()
                .single();

            if (convError) throw convError;

            // 2. Insert message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversation.id,
                    sender_id: user.id,
                    content: content.trim()
                });

            if (msgError) throw msgError;

            onClose();
            router.push('/dashboard/messages');
        } catch (err: any) {
            console.error('Error sending message:', err);
            const message = err.message || 'Error al enviar el mensaje. Reintentá en unos segundos.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

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
                            placeholder="Ej: Hola, me gustaría saber si el presupuesto incluye materiales..."
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
                                    <span>Enviar pregunta</span>
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
