'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [locationId, setLocationId] = useState('');
    const [role, setRole] = useState<'cliente' | 'prestador'>('cliente');
    // Business fields (for providers)
    const [providerType, setProviderType] = useState<'independent' | 'business'>('independent');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registered, setRegistered] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);

    const router = useRouter();
    const supabase = createClient();

    // Fetch locations
    useEffect(() => {
        async function fetchLocations() {
            const { data } = await supabase
                .from('locations')
                .select('*')
                .order('province', { ascending: true })
                .order('city', { ascending: true });
            if (data) setLocations(data);
        }
        fetchLocations();
    }, []);



    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const fullName = role === 'prestador' && businessName
            ? businessName
            : `${firstName} ${lastName}`.trim();

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Update profile with additional fields
        if (authData.user) {
            const updateData: any = {
                location_id: locationId ? parseInt(locationId) : null
            };

            // Add business fields for providers
            if (role === 'prestador') {
                updateData.provider_type = providerType;

                if (providerType === 'business') {
                    updateData.business_name = businessName;
                }
                updateData.phone = phone;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', authData.user.id);

            if (profileError) {
                console.error('Error updating profile:', profileError);
                // We don't block registration success but we log it. 
                // Alternatively, we could show error. For now logging is better than silence.
            }
        }

        if (authData.session) {
            router.push('/dashboard/profile');
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

                    {/* Conditional fields based on role */}
                    {role === 'prestador' ? (
                        <div className="space-y-4">
                            {/* Provider Type Selector */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setProviderType('independent')}
                                    className={`py-2 px-3 text-sm border rounded-lg transition-all ${providerType === 'independent'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Profesional Independiente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProviderType('business')}
                                    className={`py-2 px-3 text-sm border rounded-lg transition-all ${providerType === 'business'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Empresa / PyME
                                </button>
                            </div>

                            {providerType === 'business' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        placeholder="Ej: Plomería López"
                                        className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">El nombre de tu empresa o negocio</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Ej: +54 9 11 1234-5678"
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Para que los clientes puedan contactarte</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    )}

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
                        <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zona / Localidad</label>
                        <select
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="w-full h-11 px-4 border border-gray-300 rounded-md outline-hidden focus:border-blue-500 transition-colors bg-white"
                            required
                        >
                            <option value="">Seleccioná tu zona</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.city}, {loc.province}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Esto nos ayuda a mostrarte servicios cercanos</p>
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
