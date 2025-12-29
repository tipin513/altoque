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

    // Business fields
    const [businessName, setBusinessName] = useState('');
    const [legalName, setLegalName] = useState('');
    const [website, setWebsite] = useState('');
    const [businessHours, setBusinessHours] = useState('');
    const [yearsInBusiness, setYearsInBusiness] = useState('');
    // Business Legal fields
    const [cuit, setCuit] = useState('');
    const [fiscalAddress, setFiscalAddress] = useState('');
    const [legalDocsUrl, setLegalDocsUrl] = useState('');
    const [certificatesUrl, setCertificatesUrl] = useState('');

    // Independent fields
    const [providerType, setProviderType] = useState<'independent' | 'business'>('independent');
    const [bio, setBio] = useState('');
    const [workMode, setWorkMode] = useState('solo');

    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Store original values to detect changes
    const [originalValues, setOriginalValues] = useState({
        phone: '',
        locationId: '',
        address: '',
        servicePreferences: '',
        businessName: '',
        legalName: '',
        website: '',
        businessHours: '',
        yearsInBusiness: '',
        cuit: '',
        fiscalAddress: '',
        legalDocsUrl: '',
        certificatesUrl: '',
        bio: '',
        workMode: 'solo',
        providerType: 'independent' as 'independent' | 'business'
    });

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
                const phoneVal = profileData.phone || '';
                const locationVal = profileData.location_id?.toString() || '';
                const addressVal = profileData.address || '';
                const preferencesVal = profileData.service_preferences || '';

                // Business vals
                const businessNameVal = profileData.business_name || '';
                const legalNameVal = profileData.legal_name || '';
                const websiteVal = profileData.website || '';
                const businessHoursVal = profileData.business_hours || '';
                const yearsVal = profileData.years_in_business?.toString() || '';
                const cuitVal = profileData.cuit || '';
                const fiscalAddressVal = profileData.fiscal_address || '';
                const legalDocsVal = profileData.legal_docs_url || '';
                const certificatesVal = profileData.certificates_url || '';

                // Independent vals
                const providerTypeVal = profileData.provider_type || 'independent';
                const bioVal = profileData.bio || '';
                const workModeVal = profileData.work_mode || 'solo';

                setPhone(phoneVal);
                setLocationId(locationVal);
                setAddress(addressVal);
                setServicePreferences(preferencesVal);

                setBusinessName(businessNameVal);
                setLegalName(legalNameVal);
                setWebsite(websiteVal);
                setBusinessHours(businessHoursVal);
                setYearsInBusiness(yearsVal);

                setCuit(cuitVal);
                setFiscalAddress(fiscalAddressVal);
                setLegalDocsUrl(legalDocsVal);
                setCertificatesUrl(certificatesVal);

                setProviderType(providerTypeVal);
                setBio(bioVal);
                setWorkMode(workModeVal);

                // Store original values
                setOriginalValues({
                    phone: phoneVal,
                    locationId: locationVal,
                    address: addressVal,
                    servicePreferences: preferencesVal,
                    businessName: businessNameVal,
                    legalName: legalNameVal,
                    website: websiteVal,
                    businessHours: businessHoursVal,
                    yearsInBusiness: yearsVal,
                    cuit: cuitVal,
                    fiscalAddress: fiscalAddressVal,
                    legalDocsUrl: legalDocsVal,
                    certificatesUrl: certificatesVal,
                    bio: bioVal,
                    workMode: workModeVal,
                    providerType: providerTypeVal as 'independent' | 'business'
                });
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

    // Detect changes
    useEffect(() => {
        const changed =
            phone !== originalValues.phone ||
            locationId !== originalValues.locationId ||
            address !== originalValues.address ||
            servicePreferences !== originalValues.servicePreferences ||
            businessName !== originalValues.businessName ||
            legalName !== originalValues.legalName ||
            website !== originalValues.website ||
            businessHours !== originalValues.businessHours ||
            yearsInBusiness !== originalValues.yearsInBusiness ||
            cuit !== originalValues.cuit ||
            fiscalAddress !== originalValues.fiscalAddress ||
            legalDocsUrl !== originalValues.legalDocsUrl ||
            certificatesUrl !== originalValues.certificatesUrl ||
            bio !== originalValues.bio ||
            workMode !== originalValues.workMode ||
            providerType !== originalValues.providerType;

        setHasChanges(changed);
    }, [phone, locationId, address, servicePreferences, businessName, legalName, website, businessHours, yearsInBusiness, bio, workMode, cuit, fiscalAddress, legalDocsUrl, certificatesUrl, providerType, originalValues]);

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

        const updateData: any = {
            phone,
            location_id: locationId ? parseInt(locationId) : null,
            address,
            service_preferences: servicePreferences,
        };

        // Add business fields if provider
        if (profile?.role === 'prestador') {
            updateData.provider_type = providerType;

            if (providerType === 'business') {
                // Validation for mandatory business fields
                if (!legalName.trim()) {
                    setError('La Razón Social es obligatoria');
                    setSaving(false);
                    return;
                }
                if (!cuit.trim()) {
                    setError('El CUIT es obligatorio');
                    setSaving(false);
                    return;
                }
                if (!fiscalAddress.trim()) {
                    setError('La Dirección Fiscal es obligatoria');
                    setSaving(false);
                    return;
                }

                updateData.business_name = businessName;
                updateData.legal_name = legalName;
                updateData.website = website;
                updateData.business_hours = businessHours;
                updateData.years_in_business = yearsInBusiness ? parseInt(yearsInBusiness) : null;
                updateData.cuit = cuit;
                updateData.fiscal_address = fiscalAddress;
                // Docs URLs would ideally be handled by file upload logic, but saving strings for now
                updateData.legal_docs_url = legalDocsUrl;
                updateData.certificates_url = certificatesUrl;
            } else {
                // Independent fields
                updateData.bio = bio;
                updateData.years_in_business = yearsInBusiness ? parseInt(yearsInBusiness) : null;
                updateData.business_hours = businessHours; // Reusing for availability
                updateData.work_mode = workMode;
            }
        }

        const { data, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select();

        if (updateError) {
            console.error('Error al guardar:', updateError);
            setError(updateError.message || 'Error al guardar los cambios');
        } else {
            setSuccess(true);
            // Update original values
            setOriginalValues({
                phone,
                locationId,
                address,
                servicePreferences,
                businessName,
                legalName,
                website,
                businessHours,
                yearsInBusiness,
                cuit,
                fiscalAddress,
                legalDocsUrl,
                certificatesUrl,
                bio,
                workMode,
                providerType
            });
            setHasChanges(false);
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
                        {/* Fields for Providers */}
                        {profile?.role === 'prestador' && (
                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 mb-6 space-y-6">
                                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                    <span className="text-xl">
                                        {providerType === 'independent' ? '🛠️' : '🏢'}
                                    </span>
                                    {providerType === 'independent' ? 'Perfil Profesional' : 'Información del Negocio'}
                                </h3>

                                {/* Provider Type Indicator (Read-only) */}
                                <div className="bg-indigo-100/50 p-4 rounded-2xl border border-indigo-200 flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${providerType === 'independent' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        🛠️
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Tipo de Cuenta</p>
                                        <p className="text-indigo-900 font-bold text-lg leading-none">
                                            {providerType === 'independent' ? 'Profesional Independiente' : 'Empresa / PyME'}
                                        </p>
                                    </div>
                                    {providerType === 'business' && (
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg shadow-sm">
                                            🏢
                                        </div>
                                    )}
                                </div>

                                {providerType === 'independent' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                Descripción Breve (Bio)
                                            </label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Ej: Electricista matriculado, urgencias 24 hs"
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all resize-none"
                                            />
                                            <p className="text-xs text-slate-500 mt-2">Un título corto que describa tu servicio</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Años de experiencia
                                                </label>
                                                <input
                                                    type="number"
                                                    value={yearsInBusiness}
                                                    onChange={(e) => setYearsInBusiness(e.target.value)}
                                                    placeholder="Ej: 5"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Días y horarios disponibles
                                                </label>
                                                <input
                                                    type="text"
                                                    value={businessHours}
                                                    onChange={(e) => setBusinessHours(e.target.value)}
                                                    placeholder="Ej: Lun a Sab 8 a 18hs"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                Modalidad de Trabajo
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setWorkMode('solo')}
                                                    className={`py-3 px-4 rounded-2xl border text-sm font-medium transition-all ${workMode === 'solo'
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-102'
                                                        : 'bg-white text-slate-600 border-indigo-100 hover:bg-indigo-50'
                                                        }`}
                                                >
                                                    👤 Trabajo solo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setWorkMode('helper')}
                                                    className={`py-3 px-4 rounded-2xl border text-sm font-medium transition-all ${workMode === 'helper'
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-102'
                                                        : 'bg-white text-slate-600 border-indigo-100 hover:bg-indigo-50'
                                                        }`}
                                                >
                                                    👥 Con ayudante ocasional
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Nombre Comercial
                                                </label>
                                                <input
                                                    type="text"
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    placeholder="Nombre de tu empresa"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Razón Social <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={legalName}
                                                    onChange={(e) => setLegalName(e.target.value)}
                                                    placeholder="Nombre legal completo"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    CUIT <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cuit}
                                                    onChange={(e) => setCuit(e.target.value)}
                                                    placeholder="20-12345678-9"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Dirección Fiscal <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fiscalAddress}
                                                    onChange={(e) => setFiscalAddress(e.target.value)}
                                                    placeholder="Calle, Número, Localidad"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                                <span className="text-lg">⚖️</span> Documentación Obligatoria
                                            </h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                                                        Documentación Legal
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={legalDocsUrl}
                                                        onChange={(e) => setLegalDocsUrl(e.target.value)}
                                                        placeholder="Link a carpeta Drive/Dropbox"
                                                        className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 focus:border-amber-500 outline-none text-sm"
                                                    />
                                                    <p className="text-[10px] text-amber-700 mt-1">Estatuto, constancia de inscripción, etc.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                                                        Certificados / Habilitaciones
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={certificatesUrl}
                                                        onChange={(e) => setCertificatesUrl(e.target.value)}
                                                        placeholder="Link a certificados"
                                                        className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 focus:border-amber-500 outline-none text-sm"
                                                    />
                                                    <p className="text-[10px] text-amber-700 mt-1">Matrículas, habilitaciones municipales.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Sitio Web / Redes
                                                </label>
                                                <input
                                                    type="text"
                                                    value={website}
                                                    onChange={(e) => setWebsite(e.target.value)}
                                                    placeholder="ej: www.miempresa.com"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                    Años en actividad
                                                </label>
                                                <input
                                                    type="number"
                                                    value={yearsInBusiness}
                                                    onChange={(e) => setYearsInBusiness(e.target.value)}
                                                    placeholder="Ej: 5"
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                                                Horarios de Atención
                                            </label>
                                            <input
                                                type="text"
                                                value={businessHours}
                                                onChange={(e) => setBusinessHours(e.target.value)}
                                                placeholder="Ej: Lun a Vie 9 a 18hs"
                                                className="w-full px-4 py-3 bg-white rounded-2xl border border-indigo-100 focus:border-indigo-500 focus:shadow-md outline-none transition-all"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

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
                                disabled={saving || !hasChanges}
                                className="btn-primary h-14 px-8 rounded-2xl text-lg flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : hasChanges ? (
                                    'Guardar Cambios'
                                ) : (
                                    '✓ Guardado'
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
        </div >
    );
}
