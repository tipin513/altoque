'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'cliente' | 'prestador'>('cliente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registered, setRegistered] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.session) {
            router.push('/dashboard');
            router.refresh();
        } else {
            setRegistered(true);
        }

        setLoading(false);
    };

    if (registered) {
        return (
            <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4 py-10">
                <div className="max-w-[450px] w-full space-y-8 p-10 bg-white rounded-lg shadow-sm text-center">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                            <CheckCircle2 size={40} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-800">¡Cuenta creada con éxito!</h1>
                        <p className="text-gray-500">Para continuar, por favor revisá tu casilla de correo.</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-left">
                        <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Confirmá tu email</p>
                            <p className="text-xs text-blue-800 mt-1">Te enviamos un enlace de activación a <b>{email}</b>. Hacé clic en el botón del mensaje para validar tu cuenta.</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Link href="/login" className="ml-button-primary block w-full">
                            Ir al Ingreso
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="max-w-[450px] w-full space-y-8 p-8 bg-white rounded-lg shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Completá tus datos para registrarte</h1>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setRole('cliente')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'cliente' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Soy Cliente
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('prestador')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'prestador' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Soy Prestador
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#3483fa] text-white font-bold rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        ¿Ya tenés cuenta?{' '}
                        <Link href="/login" className="text-blue-600 font-medium hover:underline">
                            Ingresá
                        </Link>
                    </p>
                </div>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    Al crear tu cuenta, aceptás los Términos y Condiciones y la Política de Privacidad de Altoque.
                </p>
            </div>
        </div>
    );
}
