'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
    hireId: string;
    serviceId: string;
    serviceTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ReviewModal({ hireId, serviceId, serviceTitle, isOpen, onClose, onSuccess }: ReviewModalProps) {
    const supabase = createClient();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Por favor, seleccioná una calificación');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Debes iniciar sesión para calificar');

            const { error: reviewError } = await supabase
                .from('reviews')
                .insert({
                    hire_id: hireId,
                    service_id: serviceId,
                    client_id: user.id,
                    rating,
                    comment
                });

            if (reviewError) {
                if (reviewError.code === '23505') {
                    throw new Error('Ya calificaste este servicio');
                }
                throw reviewError;
            }

            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error('Error submitting review:', err);
            // Better error extraction for Supabase/Postgrest errors
            const errorMessage = err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : 'Error al enviar la calificación');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <Star size={32} fill={rating > 0 ? "currentColor" : "none"} />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                            <X size={24} />
                        </button>
                    </div>

                    {!success ? (
                        <>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">¿Cómo fue tu experiencia?</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Calificá el servicio de <span className="font-bold text-slate-800">"{serviceTitle}"</span> para ayudar a otros usuarios.
                            </p>

                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`p-1 transition-all transform hover:scale-110 ${(hover || rating) >= star ? 'text-amber-400' : 'text-slate-200'
                                            }`}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star size={40} fill={(hover || rating) >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Tu comentario (opcional)</label>
                                <textarea
                                    className="w-full h-32 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all resize-none text-slate-700"
                                    placeholder="Contanos qué te pareció el servicio..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn-primary h-14 w-full rounded-2xl flex items-center justify-center gap-2 text-lg"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : 'Enviar Calificación'}
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="h-14 w-full rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 animate-bounce">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">¡Gracias por tu opinión!</h2>
                            <p className="text-slate-500">Tu calificación ha sido publicada con éxito.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
