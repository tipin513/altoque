'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, MapPin, Phone, Home, Star, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);

    const [phone, setPhone] = useState('');
    const [locationId, setLocationId] = useState('');
    const [address, setAddress] = useState('');
    const [servicePreferences, setServicePreferences] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setPhone(profileData.phone || '');
                setLocationId(profileData.location_id?.toString() || '');
                setAddress(profileData.address || '');
                setServicePreferences(profileData.service_preferences || '');
            }

            const { data: locationsData } = await supabase
                .from('locations')
                .select('*')
                .order('province', { ascending: true })
                .order('city', { ascending: true });

            if (locationsData) setLocations(locationsData);
            setLoading(false);
        }

        loadProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('No estás autenticado');
            setSaving(false);
            return;
        }

        console.log('Guardando perfil:', {
            phone,
            location_id: locationId ? parseInt(locationId) : null,
            address,
            service_preferences: servicePreferences,
        });

        const { data, error: updateError } = await supabase
            .from('profiles')
            .update({
                phone,
                location_id: locationId ? parseInt(locationId) : null,
                address,
                service_preferences: servicePreferences,
            })
            .eq('id', user.id)
            .select();

        console.log('Resultado:', { data, error: updateError });

        if (updateError) {
            console.error('Error al guardar:', updateError);
            setError(updateError.message || 'Error al guardar los cambios');
        } else {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="bg-[#f8fafc] min-h-screen py-12 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">Panel</Link>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">Mi Perfil</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
                    <p className="text-slate-500 mt-1">Completá tu información para una mejor experiencia.</p>
                </header>

                {/* Profile Header */}
                <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[24px] flex items-center justify-center text-white shadow-xl">
                            <User size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{profile?.full_name}</h2>
                            <p className="text-slate-500 mt-1">
                                {profile?.role === 'prestador' ? '🔧 Prestador de Servicios' : '👤 Cliente'}
                            </p>
                            <p className="text-sm text-slate-400 mt-2">{profile?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Star size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Información Adicional</h2>
                            <p className="text-slate-500 text-sm">Ayudanos a brindarte un mejor servicio</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Phone size={16} />
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ej: +54 9 11 1234-5678"
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700"
                            />
                            <p className="text-xs text-slate-500 mt-2">Para contacto rápido con prestadores o clientes</p>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <MapPin size={16} />
                                Zona / Localidad
                            </label>
                            <select
                                value={locationId}
                                onChange={(e) => setLocationId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700"
                            >
                                <option value="">Seleccioná tu zona</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.city}, {loc.province}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-2">Esto nos ayuda a mostrarte servicios cercanos</p>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Home size={16} />
                                Dirección Aproximada
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ej: Barrio Palermo, cerca de Plaza Italia"
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700"
                            />
                            <p className="text-xs text-slate-500 mt-2">No es necesario que sea exacta, solo una referencia</p>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Star size={16} />
                                Preferencias de Servicios
                            </label>
                            <textarea
                                value={servicePreferences}
                                onChange={(e) => setServicePreferences(e.target.value)}
                                placeholder="Ej: Prefiero servicios de plomería, electricidad y jardinería"
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-500 focus:bg-white focus:shadow-md outline-none transition-all text-slate-700 resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">Ayudanos a recomendarte servicios relevantes</p>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-medium">
                                <CheckCircle size={18} />
                                ¡Perfil actualizado correctamente!
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary h-14 px-8 rounded-2xl text-lg flex items-center justify-center gap-2 flex-1"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                            <Link
                                href="/dashboard"
                                className="h-14 px-8 rounded-2xl text-lg flex items-center justify-center border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-bold"
                            >
                                Volver al Panel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
