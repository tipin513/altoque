'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err: any) {
            console.error('Error sending reset email:', err);
            setError(err.message || 'Error al enviar el email de recuperación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-10">
                        {!success ? (
                            <>
                                <div className="w-16 h-16 bg-indigo-100 rounded-[20px] flex items-center justify-center text-indigo-600 mb-6">
                                    <Mail size={32} />
                                </div>

                                <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                    ¿Olvidaste tu contraseña?
                                </h1>
                                <p className="text-slate-500 mb-8 leading-relaxed">
                                    No te preocupes. Ingresá tu email y te enviaremos un link para que puedas resetearla.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700"
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                                            <AlertCircle size={18} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full h-14 rounded-2xl text-lg flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar link de recuperación'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                        Volver al login
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 animate-bounce">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-3">¡Email enviado!</h2>
                                <p className="text-slate-500 mb-8 leading-relaxed">
                                    Revisá tu casilla de correo. Te enviamos un link para resetear tu contraseña.
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                    Volver al login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
