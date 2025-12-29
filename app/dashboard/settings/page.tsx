'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, ChevronRight, AlertCircle, CheckCircle, Loader2, Eye, EyeOff, User, Mail } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const supabase = createClient();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error updating password:', err);
            setError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">Panel</Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">Configuración</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Configuración</h1>
                    <p className="text-slate-500 mt-1">Gestioná tu cuenta y preferencias.</p>
                </header>

                <div className="space-y-6">
                    {/* Account Information */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Información de Cuenta</h2>
                                <p className="text-slate-500 text-sm">Datos personales y de contacto</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100">
                            <p className="text-slate-600 text-sm">
                                Para modificar tu información personal, contactá con soporte.
                            </p>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cambiar Contraseña</h2>
                                <p className="text-slate-500 text-sm">Actualizá tu contraseña de acceso</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(!showPasswords)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium">
                                    <CheckCircle size={18} />
                                    ¡Contraseña actualizada correctamente!
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary h-14 px-8 rounded-2xl text-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    'Actualizar contraseña'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Email Preferences */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Preferencias de Email</h2>
                                <p className="text-slate-500 text-sm">Gestioná tus notificaciones</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100">
                            <p className="text-slate-600 text-sm">
                                Próximamente podrás configurar tus preferencias de notificaciones por email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
