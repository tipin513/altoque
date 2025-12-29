'use client';

import { useState, useEffect, use } from 'react';
import { MapPin, ShieldCheck, MessageSquare, Clock, Star, Share2, Heart, ChevronLeft, ChevronRight, CheckCircle2, User, Map as MapIcon, Globe } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MessageModal from '@/components/MessageModal';
import HireModal from '@/components/HireModal';
import TrustBadge from '@/components/TrustBadge';

export default function ServiceDetailPage({ params }: { params: any }) {
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const supabase = createClient();
    const resolvedParams: any = use(params);

    useEffect(() => {
        async function fetchService() {
            try {
                const { data, error } = await supabase
                    .from('services')
                    .select(`
                        *,
                        profiles(*),
                        categories(name),
                        locations(province, city),
                        service_images(image_url),
                        service_areas(
                            locations(city)
                        )
                    `)
                    .eq('id', resolvedParams.id)
                    .single();

                if (error) {
                    console.error('Error fetching service:', error);

                    // Fallback: If it's a schema error with service_areas, try without it
                    if (error.message?.includes('service_areas') || error.code === 'PGRST204') {
                        const { data: fallbackData } = await supabase
                            .from('services')
                            .select(`
                                *,
                                profiles(*),
                                categories(name),
                                locations(province, city),
                                service_images(image_url)
                            `)
                            .eq('id', resolvedParams.id)
                            .single();
                        if (fallbackData) setService(fallbackData);
                    }
                } else if (data) {
                    setService(data);

                    // Fetch reviews
                    const { data: reviewsData } = await supabase
                        .from('reviews')
                        .select(`
                            *,
                            profiles(*)
                        `)
                        .eq('service_id', resolvedParams.id)
                        .order('created_at', { ascending: false });

                    if (reviewsData) setReviews(reviewsData);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchService();
    }, [resolvedParams.id, supabase]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Cargando servicio...</p>
        </div>
    </div>;

    if (!service) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">Servicio no encontrado</div>;

    const images = service.service_images || [];
    const mainImage = images[activeImage]?.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop';
    const otherAreas = service.service_areas?.map((a: any) => a.locations?.city) || [];

    return (
        <div className="bg-[#f8fafc] min-h-screen py-10">
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Contenido Principal */}
                    <div className="flex-grow space-y-6">
                        <div className="at-card p-6 md:p-10 border-none">
                            <div className="flex flex-col md:flex-row gap-12">

                                {/* Galería */}
                                <div className="w-full md:w-[60%] space-y-6">
                                    <div className="aspect-square bg-white border border-slate-100 flex items-center justify-center overflow-hidden rounded-3xl relative group shadow-sm">
                                        <img src={mainImage} className="w-full h-full object-contain" alt={service.title} />

                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                                                >
                                                    <ChevronLeft size={24} className="text-slate-700" />
                                                </button>
                                                <button
                                                    onClick={() => setActiveImage(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                                                >
                                                    <ChevronRight size={24} className="text-slate-700" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {images.map((img: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(idx)}
                                                className={`w-20 h-20 flex-shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-300 ${activeImage === idx ? 'border-indigo-500 ring-4 ring-indigo-50/50 scale-105 shadow-md' : 'border-slate-100 grayscale-[0.5] hover:grayscale-0'}`}
                                            >
                                                <img src={img.image_url} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumen */}
                                <div className="flex-grow space-y-8">
                                    <div className="flex justify-between items-center">
                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            {service.categories?.name}
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors active:scale-90 shadow-sm">
                                                <Heart size={20} />
                                            </button>
                                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors active:scale-90 shadow-sm">
                                                <Share2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                        {service.title}
                                    </h1>

                                    <div className="flex items-center gap-2 text-amber-400">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    fill={i <= (service.rating || 0) ? "currentColor" : "none"}
                                                    className={i <= (service.rating || 0) ? "text-amber-400" : "text-slate-200"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-slate-400 text-sm font-medium">({service.review_count || 0} opiniones)</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                                {formatPrice(service.price_from)}
                                            </span>
                                        </div>
                                        {service.price_from > 0 && (
                                            <p className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg w-fit">
                                                Hasta 6 cuotas de {formatPrice(service.price_from / 6)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-2xl flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Contactá directamente</p>
                                            <p className="text-xs text-slate-500">Respondemos normalmente en menos de 1 hora.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setIsHireModalOpen(true)}
                                            className="btn-primary h-14 text-lg rounded-2xl shadow-lg shadow-indigo-200"
                                        >
                                            Contratar servicio
                                        </button>
                                        <button
                                            onClick={() => setIsMessageModalOpen(true)}
                                            className="btn-secondary h-14 text-lg rounded-2xl border-2 border-slate-100 text-slate-700 hover:bg-slate-50"
                                        >
                                            Hacer una pregunta
                                        </button>
                                    </div>

                                    <MessageModal
                                        serviceId={service.id}
                                        sellerId={service.user_id}
                                        serviceTitle={service.title}
                                        isOpen={isMessageModalOpen}
                                        onClose={() => setIsMessageModalOpen(false)}
                                    />

                                    <HireModal
                                        serviceId={service.id}
                                        providerId={service.user_id}
                                        serviceTitle={service.title}
                                        isOpen={isHireModalOpen}
                                        onClose={() => setIsHireModalOpen(false)}
                                    />
                                </div>
                            </div>

                            <div className="mt-16 pt-16 border-t border-slate-100">
                                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Sobre el servicio</h2>
                                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-light">
                                    {service.description}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="mt-16 pt-16 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Opiniones de clientes</h2>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                        <Star size={20} fill="currentColor" className="text-amber-400" />
                                        <span className="text-xl font-black text-slate-900">{service.rating?.toFixed(1) || '0.0'}</span>
                                        <span className="text-slate-400 font-bold">/ 5</span>
                                    </div>
                                </div>

                                {reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 flex flex-col md:flex-row gap-6">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                                                        {review.profiles?.avatar_url ? (
                                                            <img src={review.profiles.avatar_url} className="w-full h-full rounded-2xl object-cover" />
                                                        ) : (
                                                            <User size={24} />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-grow space-y-2">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                        <p className="font-black text-slate-800">{review.profiles?.full_name}</p>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    fill={i <= review.rating ? "currentColor" : "none"}
                                                                    className={i <= review.rating ? "text-amber-400" : "text-slate-100"}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed font-light">{review.comment}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                                        {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border border-slate-100/50">
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aún no hay opiniones para este servicio</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lateral */}
                    <aside className="w-full lg:w-96 space-y-6">
                        {/* FICHA 1: Datos del prestador */}
                        <div className="at-card p-8 space-y-8 border-none bg-white">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Datos del prestador</h3>

                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                                    <User size={32} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-slate-900 text-lg leading-none">{service.profiles?.full_name}</p>

                                    <div className="flex flex-col gap-1 mt-1">
                                        {(service.profiles?.is_identity_verified || service.profiles?.is_professional_verified) ? (
                                            <>
                                                {service.profiles?.is_identity_verified && (
                                                    <TrustBadge type="identity" showLabel={true} />
                                                )}
                                                {service.profiles?.is_professional_verified && (
                                                    <TrustBadge type="professional" showLabel={true} />
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <span className="text-xs font-medium">Perfil no verificado</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <span className="font-bold">{service.locations?.city}</span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{service.locations?.province}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Clock size={18} />
                                    </div>
                                    <span>Atención inmediata</span>
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                                <div className="flex gap-3">
                                    <ShieldCheck className="text-indigo-600 flex-shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Servicio Asegurado</p>
                                        <p className="text-xs text-indigo-800/70 mt-1">Tu contratación está protegida por nuestra garantía de satisfacción.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FICHA 2: Ubicación y Cobertura (Relocalizada) */}
                        <div className="at-card p-8 space-y-6 border-none bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <MapIcon size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ubicación y Cobertura</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sede principal</p>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <MapPin size={18} className="text-indigo-500" />
                                        <p className="font-bold">{service.locations?.city}</p>
                                    </div>
                                </div>

                                {otherAreas.length > 0 && (
                                    <div className="pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Globe size={14} className="text-indigo-600" />
                                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Zonas de atención extra</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {otherAreas.map((area: string, idx: number) => (
                                                <span key={idx} className="bg-indigo-50/50 px-3 py-1.5 rounded-xl text-[11px] font-bold text-indigo-700 border border-indigo-100 flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all cursor-default group">
                                                    <div className="w-1 h-1 rounded-full bg-indigo-400 group-hover:bg-white transition-colors"></div>
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-4 italic font-medium leading-tight">
                                            Este profesional se desplaza a estas localidades.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
