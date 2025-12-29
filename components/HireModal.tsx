'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HireModalProps {
    serviceId: string;
    providerId: string;
    serviceTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function HireModal({ serviceId, providerId, serviceTitle, isOpen, onClose }: HireModalProps) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Debes iniciar sesión para contratar un servicio');

            if (user.id === providerId) {
                throw new Error('No podés contratar tu propio servicio');
            }

            const { error: hireError } = await supabase
                .from('hires')
                .insert({
                    service_id: serviceId,
                    client_id: user.id,
                    provider_id: providerId,
                    status: 'pending'
                });

            if (hireError) throw hireError;

            // 2. Automated Message: Create conversation and initial message
            const { data: conversation, error: convError } = await supabase
                .from('conversations')
                .upsert({
                    service_id: serviceId,
                    buyer_id: user.id,
                    seller_id: providerId
                }, { onConflict: 'service_id, buyer_id, seller_id' })
                .select()
                .single();

            if (!convError && conversation) {
                await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversation.id,
                        sender_id: user.id,
                        content: `¡Hola! He solicitado contratar tu servicio: "${serviceTitle}". Por favor, confirmá la solicitud para empezar.`
                    });
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                router.push('/dashboard/my-hires');
            }, 2000);

        } catch (err: any) {
            console.error('Error hiring service:', err);
            setError(err.message || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <CheckCircle size={32} />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                            <X size={24} />
                        </button>
                    </div>

                    {!success ? (
                        <>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">¿Confirmás la contratación?</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Estás a punto de solicitar el servicio de <span className="font-bold text-slate-800">"{serviceTitle}"</span>.
                                El prestador recibirá tu solicitud y se pondrá en contacto con vos a través del chat.
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="btn-primary h-14 w-full rounded-2xl flex items-center justify-center gap-2 text-lg"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : 'Confirmar Contratación'}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="h-14 w-full rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 animate-bounce">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">¡Solicitud Enviada!</h2>
                            <p className="text-slate-500">Estamos redirigiéndote a tus contrataciones...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
