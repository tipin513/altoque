'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Upload, Loader2, CheckCircle2, X, Image as ImageIcon, Sparkles, MapPin, Check } from 'lucide-react';
import Link from 'next/link';

export default function NewServicePage() {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [success, setSuccess] = useState(false);

    // State for images
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        location_id: '',
        price_from: '',
    });

    const [selectedAreas, setSelectedAreas] = useState<number[]>([]);

    useEffect(() => {
        async function fetchData() {
            const { data: catData } = await supabase.from('categories').select('*').order('name');
            const { data: locData } = await supabase.from('locations').select('*').order('province');

            const [blocked, setBlocked] = useState(false);

            useEffect(() => {
                async function fetchData() {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        router.push('/login');
                        return;
                    }

                    // Fetch Profile to check eligibility
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profile?.role === 'prestador' && profile?.provider_type === 'business') {
                        if (!profile.cuit || !profile.fiscal_address || !profile.legal_name) {
                            setBlocked(true);
                        }
                    }

                    const { data: catData } = await supabase.from('categories').select('*').order('name');
                    const { data: locData } = await supabase.from('locations').select('*').order('province');

                    if (catData) setCategories(catData);
                    if (locData) setLocations(locData);
                }
                fetchData();
            }, []);

            if (blocked) {
                return (
                    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                        <div className="at-card max-w-lg w-full p-10 text-center space-y-6 border-red-100 bg-red-50/50">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                                <X size={40} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 mb-2">Acceso Restringido</h1>
                                <p className="text-slate-600 mb-6 font-medium">
                                    Como cuenta de Empresa, es obligatorio que completes tu <strong>Documentación Legal</strong> antes de poder publicar servicios.
                                </p>
                                <ul className="text-left text-sm text-slate-500 bg-white p-4 rounded-xl border border-red-100 space-y-2 mb-6 inline-block w-full">
                                    <li className="flex items-center gap-2">❌ CUIT / Razón Social</li>
                                    <li className="flex items-center gap-2">❌ Dirección Fiscal</li>
                                </ul>
                                <Link
                                    href="/dashboard/profile"
                                    className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-200"
                                >
                                    Ir a Completar Perfil
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            }

            const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                    const files = Array.from(e.target.files);
                    const newFiles = [...selectedFiles, ...files].slice(0, 5); // Max 5
                    setSelectedFiles(newFiles);
                    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
                    setPreviews(newPreviews);
                }
            };

            const removeFile = (index: number) => {
                const newFiles = [...selectedFiles];
                newFiles.splice(index, 1);
                setSelectedFiles(newFiles);
                const newPreviews = [...previews];
                URL.revokeObjectURL(newPreviews[index]);
                newPreviews.splice(index, 1);
                setPreviews(newPreviews);
            };

            const toggleArea = (id: number) => {
                if (selectedAreas.includes(id)) {
                    setSelectedAreas(selectedAreas.filter(a => a !== id));
                } else {
                    setSelectedAreas([...selectedAreas, id]);
                }
            };

            const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setLoading(true);

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) { router.push('/login'); return; }

                    // 1. Insert Service
                    const { data: service, error: serviceError } = await supabase
                        .from('services')
                        .insert([{
                            user_id: user.id,
                            title: formData.title,
                            description: formData.description,
                            category_id: parseInt(formData.category_id),
                            location_id: parseInt(formData.location_id),
                            price_from: formData.price_from ? parseFloat(formData.price_from) : null,
                            is_active: true,
                        }])
                        .select().single();

                    if (serviceError) throw serviceError;

                    // 2. Insert Service Areas (Many-to-Many)
                    if (selectedAreas.length > 0) {
                        const areasData = selectedAreas.map(locId => ({
                            service_id: service.id,
                            location_id: locId
                        }));
                        await supabase.from('service_areas').insert(areasData);
                    }

                    // 3. Upload Images
                    if (selectedFiles.length > 0) {
                        for (const file of selectedFiles) {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Math.random()}.${fileExt}`;
                            const filePath = `${user.id}/${service.id}/${fileName}`;
                            const { error: uploadError } = await supabase.storage.from('service-images').upload(filePath, file);
                            if (!uploadError) {
                                const { data: { publicUrl } } = supabase.storage.from('service-images').getPublicUrl(filePath);
                                await supabase.from('service_images').insert({ service_id: service.id, image_url: publicUrl });
                            }
                        }
                    }

                    setSuccess(true);
                    setTimeout(() => { router.push('/dashboard/my-services'); }, 2000);
                } catch (error: any) {
                    alert('Error: ' + error.message);
                } finally {
                    setLoading(false);
                }
            };

            if (success) {
                return (
                    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                        <div className="at-card max-w-md w-full p-10 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">¡Publicación exitosa!</h1>
                                <p className="text-slate-500 mt-2">Tu servicio ya se encuentra disponible para todos.</p>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="bg-[#f8fafc] min-h-screen py-12">
                    <div className="max-w-[800px] mx-auto px-6">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors group">
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            VOLVER AL PANEL
                        </Link>

                        <div className="at-card overflow-hidden">
                            <header className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight">Crear publicación</h1>
                                        <p className="text-indigo-200 opacity-80 uppercase text-[10px] font-black tracking-widest mt-0.5">NUEVO ANUNCIO</p>
                                    </div>
                                </div>
                            </header>

                            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10 bg-white">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">¿Qué servicio ofrecés?</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Instalación de aires acondicionados"
                                        className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-medium placeholder:text-slate-300"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Categoría</label>
                                        <select
                                            className="w-full h-14 px-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-medium appearance-none"
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Ubicación principal (Base)</label>
                                        <select
                                            className="w-full h-14 px-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-medium appearance-none"
                                            value={formData.location_id}
                                            onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                                            required
                                        >
                                            <option value="">¿Dónde estás?</option>
                                            {locations.map((l) => (
                                                <option key={l.id} value={l.id}>{l.city}, {l.province}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* ZONAS DE COBERTURA - NEW FEATURE */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-indigo-600" />
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Zonás de cobertura (Otras localidades)</label>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium -mt-2 italic">Seleccioná todos los barrios o ciudades donde también brindás servicio.</p>

                                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                        {locations.map((l) => {
                                            const isSelected = selectedAreas.includes(l.id);
                                            const isBase = formData.location_id === l.id.toString();
                                            if (isBase) return null; // No mostrar la base como zona extra

                                            return (
                                                <button
                                                    key={l.id}
                                                    type="button"
                                                    onClick={() => toggleArea(l.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${isSelected
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-105'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                                                        }`}
                                                >
                                                    {isSelected && <Check size={12} />}
                                                    {l.city}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Precio base sugerido (opcional)</label>
                                    <div className="relative max-w-[240px]">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full h-14 pl-12 pr-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-bold placeholder:text-slate-300"
                                            value={formData.price_from}
                                            onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium ml-1 italic">* Si lo dejás en 0 aparecerá como "Consultar"</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Descripción detallada</label>
                                    <textarea
                                        placeholder="Contales a tus clientes qué incluye tu servicio, tus horarios y tu experiencia..."
                                        className="w-full min-h-[180px] p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-light leading-relaxed resize-none placeholder:text-slate-300"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon size={20} className="text-indigo-600" />
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Fotos de tu trabajo (Máx 5)</label>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {previews.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm group">
                                                <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-rose-600 font-black"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedFiles.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 transition-all group"
                                            >
                                                <Upload size={28} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">Subir Foto</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary h-14 px-12 text-lg rounded-2xl shadow-xl shadow-indigo-200"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Publicar Ahora'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            );
        }
