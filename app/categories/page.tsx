import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
    Wrench, Zap, Droplets, PaintBucket, Hammer, Flame, Monitor,
    Tv, ShieldCheck, Shovel, Scissors, Layout, Palette, Megaphone, Share2,
    Settings, ChevronRight, ArrowRight, Box, Car, Bike, Key, Truck, Dog,
    HardHat, CarFront, CheckCircle2, Lightbulb
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    'aire-acondicionado': Wrench,
    'instalacion-tv': Tv,
    'electricidad': Zap,
    'plomeria': Droplets,
    'albanileria': Hammer,
    'gas': Flame,
    'carpinteria': Hammer,
    'herreria': ShieldCheck,
    'pintura': PaintBucket,
    'limpieza': CheckCircle2,
    'jardineria': Scissors,
    'informatica': Monitor,
    'diseno-grafico': Palette,
    'marketing': Megaphone,
    'redes-sociales': Share2,
    'soporte-tecnico': Settings,
    'impresiones-3d': Box,
    'mecanica-autos': Car,
    'mecanica-motos': Bike,
    'cerrajeria': Key,
    'fletes-mudanzas': Truck,
    'fletes': Truck, // In case slug is 'fletes'
    'reparacion-electrodomesticos': Tv,
    'mascotas': Dog,
    'cadeteria': HardHat,
    'remis': CarFront,
};

const COLOR_MAP: Record<string, string> = {
    'aire-acondicionado': 'bg-blue-50 text-blue-600',
    'electricidad': 'bg-amber-50 text-amber-600',
    'plomeria': 'bg-cyan-50 text-cyan-600',
    'pintura': 'bg-rose-50 text-rose-600',
    'limpieza': 'bg-emerald-50 text-emerald-600',
    'albanileria': 'bg-slate-50 text-slate-600',
    'gas': 'bg-orange-50 text-orange-600',
    'soporte-tecnico': 'bg-indigo-50 text-indigo-600',
    'cadeteria': 'bg-red-50 text-red-600',
    'remis': 'bg-zinc-50 text-zinc-600',
    'fletes': 'bg-yellow-50 text-yellow-600',
    'mascotas': 'bg-purple-50 text-purple-600',
    'jardineria': 'bg-green-50 text-green-600',
};

export default async function CategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase.from('categories').select('*').order('name');

    return (
        <div className="bg-[#f8fafc] min-h-screen py-16">
            <div className="max-w-[1240px] mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Categorías
                        </h1>
                        <p className="text-slate-500 text-lg font-medium">Explorá todos los servicios disponibles en tu ciudad.</p>
                    </div>
                    <div className="h-1 w-20 bg-indigo-600 rounded-full hidden md:block mb-2"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories?.map((cat) => {
                        const IconComponent = ICON_MAP[cat.slug] || Layout;
                        const colorClass = COLOR_MAP[cat.slug] || 'bg-slate-50 text-slate-600';

                        return (
                            <Link
                                key={cat.slug}
                                href={`/search?category=${cat.slug}`}
                                className="group at-card p-8 border-none bg-white hover:ring-4 hover:ring-indigo-50 transition-all duration-500 block relative overflow-hidden"
                            >
                                {/* Decorative background element */}
                                <div className="absolute -right-4 -bottom-4 text-indigo-50/30 group-hover:text-indigo-100/50 transition-colors duration-500 transform scale-150 rotate-12">
                                    <IconComponent size={120} />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-all duration-500 shadow-sm`}>
                                        <IconComponent size={28} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                            {cat.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            Encontrá profesionales de {cat.name} verificados.
                                        </p>
                                        <p className="text-sm text-indigo-600 font-bold uppercase tracking-widest flex items-center gap-2 pt-2">
                                            <span>Explorar</span>
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
