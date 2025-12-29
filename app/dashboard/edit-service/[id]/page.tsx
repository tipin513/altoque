'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, Upload, Loader2, CheckCircle2, X, Image as ImageIcon, MapPin, Check } from 'lucide-react';
import Link from 'next/link';

export default function EditServicePage({ params }: { params: any }) {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resolvedParams: any = use(params);
    const serviceId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [success, setSuccess] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        location_id: '',
        price_from: '',
    });

    useEffect(() => {
        async function fetchData() {
            const { data: catData } = await supabase.from('categories').select('*').order('name');
            const { data: locData } = await supabase.from('locations').select('*').order('province');
            if (catData) setCategories(catData);
            if (locData) setLocations(locData);

            const { data: service } = await supabase
                .from('services')
                .select('*, service_images(*), service_areas(*)')
                .eq('id', serviceId)
                .single();

            if (service) {
                setFormData({
                    title: service.title,
                    description: service.description,
                    category_id: service.category_id.toString(),
                    location_id: service.location_id.toString(),
                    price_from: service.price_from?.toString() || '',
                });
                setExistingImages(service.service_images || []);
                setSelectedAreas(service.service_areas?.map((a: any) => a.location_id) || []);
            }
            setLoading(false);
        }
        fetchData();
    }, [serviceId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = existingImages.length + selectedFiles.length + files.length;
            if (totalImages > 5) {
                alert('Máximo 5 imágenes en total');
                return;
            }
            setSelectedFiles([...selectedFiles, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeExistingImage = async (imgId: string) => {
        const { error } = await supabase.from('service_images').delete().eq('id', imgId);
        if (!error) {
            setExistingImages(existingImages.filter(img => img.id !== imgId));
        }
    };

    const toggleArea = (id: number) => {
        if (selectedAreas.includes(id)) {
            setSelectedAreas(selectedAreas.filter(a => a !== id));
        } else {
            setSelectedAreas([...selectedAreas, id]);
        }
    };

    const removeNewFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Update Service
            const { error: serviceError } = await supabase
                .from('services')
                .update({
                    title: formData.title,
                    description: formData.description,
                    category_id: parseInt(formData.category_id),
                    location_id: parseInt(formData.location_id),
                    price_from: formData.price_from ? parseFloat(formData.price_from) : null,
                })
                .eq('id', serviceId);

            if (serviceError) throw serviceError;

            // 2. Update Service Areas (Syncing)
            // First delete all existing areas
            await supabase.from('service_areas').delete().eq('service_id', serviceId);
            // Then insert new ones
            if (selectedAreas.length > 0) {
                const areasData = selectedAreas.map(locId => ({
                    service_id: serviceId,
                    location_id: locId
                }));
                await supabase.from('service_areas').insert(areasData);
            }

            // 3. Upload New Images
            for (const file of selectedFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${serviceId}/${fileName}`;
                const { error: uploadError } = await supabase.storage.from('service-images').upload(filePath, file);
                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('service-images').getPublicUrl(filePath);
                    await supabase.from('service_images').insert({ service_id: serviceId, image_url: publicUrl });
                }
            }

            setSuccess(true);
            setTimeout(() => { router.push('/dashboard/my-services'); }, 2000);
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>;

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="at-card max-w-md w-full p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 size={40} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">¡Publicación actualizada!</h1>
                        <p className="text-slate-500 mt-2">Los cambios se guardaron correctamente.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen py-12">
            <div className="max-w-[800px] mx-auto px-6">
                <Link href="/dashboard/my-services" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    VOLVER A MIS PUBLICACIONES
                </Link>

                <div className="at-card overflow-hidden">
                    <header className="bg-slate-900 p-8 md:p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black tracking-tight">Editar anuncio</h1>
                            <p className="text-indigo-200 mt-2 opacity-80 uppercase text-[10px] font-black tracking-widest">Panel de Gestión</p>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10 bg-white">
                        <div className="space-y-3">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Título de tu anuncio</label>
                            <input
                                type="text"
                                className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-medium"
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
                                    {locations.map((l) => (
                                        <option key={l.id} value={l.id}>{l.city}, {l.province}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ZONAS DE COBERTURA */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-indigo-600" />
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Zonás de cobertura (Otras localidades)</label>
                            </div>

                            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                                {locations.map((l) => {
                                    const isSelected = selectedAreas.includes(l.id);
                                    const isBase = formData.location_id === l.id.toString();
                                    if (isBase) return null;

                                    return (
                                        <button
                                            key={l.id}
                                            type="button"
                                            onClick={() => toggleArea(l.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
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
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Precio estimado (opcional)</label>
                            <div className="relative max-w-[240px]">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                                <input
                                    type="number"
                                    className="w-full h-14 pl-12 pr-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-bold"
                                    value={formData.price_from}
                                    onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Descripción del servicio</label>
                            <textarea
                                className="w-full min-h-[180px] p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-700 font-light leading-relaxed resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <ImageIcon size={20} className="text-indigo-600" />
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Imágenes (Máx 5)</label>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm group">
                                        <img src={img.image_url} alt="Existing" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.id)}
                                            className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-rose-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {previews.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-sm group">
                                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewFile(index)}
                                            className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-lg transition-all hover:bg-rose-600 font-black"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-[8px] text-white font-black py-1 text-center tracking-widest uppercase">NUEVA</div>
                                    </div>
                                ))}
                                {(existingImages.length + selectedFiles.length) < 5 && (
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
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                        </div>

                        <div className="pt-10 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary h-14 px-12 text-lg rounded-2xl shadow-xl shadow-indigo-200"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
