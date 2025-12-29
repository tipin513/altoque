'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Edit2, Trash2, MapPin, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function MyServiceItem({ service }: { service: any }) {
    const router = useRouter();
    const supabase = createClient();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que querés eliminar esta publicación?')) return;

        setDeleting(true);
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', service.id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
            setDeleting(false);
        } else {
            router.refresh();
        }
    };

    const mainImage = service.service_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop';

    return (
        <div className={`at-card p-0 overflow-hidden flex flex-col group transition-all duration-500 hover:ring-4 hover:ring-indigo-50 border-none bg-white ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Image Preview */}
            <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                <img src={mainImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={service.title} />
                <div className="absolute top-4 left-4">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${service.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-white ${service.is_active ? 'animate-pulse' : ''}`}></div>
                        {service.is_active ? 'Activo' : 'Pausado'}
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                        href={`/service/${service.id}`}
                        className="w-10 h-10 bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white hover:text-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-all"
                        title="Ver publicación"
                    >
                        <ExternalLink size={18} />
                    </Link>
                </div>
            </div>

            {/* Service Info */}
            <div className="p-6 flex-grow space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{service.categories?.name}</span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                            <MapPin size={12} />
                            {service.locations?.city}
                        </div>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">{service.title}</h3>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Precio desde</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">
                            {service.price_from ? formatPrice(service.price_from) : 'Consultar'}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/dashboard/edit-service/${service.id}`}
                            className="w-11 h-11 bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl flex items-center justify-center transition-all group/edit"
                            title="Editar"
                        >
                            <Edit2 size={18} className="transition-transform group-hover/edit:rotate-12" />
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="w-11 h-11 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 group/delete"
                            title="Eliminar"
                        >
                            {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} className="transition-transform group-hover/delete:scale-110" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
