```typescript
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
    Wrench, PaintBucket, Droplets, Hammer, Zap, Monitor, Lightbulb, ShieldCheck,
    Clock, ChevronRight, Star, ArrowRight, CheckCircle2, ChevronLeft, Search, Filter, HardHat, CarFront, Truck, Bike, Layout
} from 'lucide-react';

const CATEGORIES = [
    {
        name: 'Aire Acondicionado',
        icon: Wrench,
        slug: 'aire-acondicionado',
        color: 'bg-blue-50 text-blue-600',
        description: 'Instalación, mantenimiento y reparación de equipos split y centrales.'
    },
    {
        name: 'Electricidad',
        icon: Zap,
        slug: 'electricidad',
        color: 'bg-amber-50 text-amber-600',
        description: 'Instalaciones eléctricas, reparaciones, iluminación y tableros.'
    },
    {
        name: 'Plomería',
        icon: Droplets,
        slug: 'plomeria',
        color: 'bg-cyan-50 text-cyan-600',
        description: 'Reparación de filtraciones, destapaciones e instalaciones sanitarias.'
    },
    {
        name: 'Pintura',
        icon: PaintBucket,
        slug: 'pintura',
        color: 'bg-rose-50 text-rose-600',
        description: 'Pintura de interiores, exteriores, impermeabilización y tratamientos.'
    },
    {
        name: 'Limpieza',
        icon: CheckCircle2,
        slug: 'limpieza',
        color: 'bg-emerald-50 text-emerald-600',
        description: 'Limpieza profunda de hogares, oficinas y finales de obra.'
    },
    {
        name: 'Albañilería',
        icon: Hammer,
        slug: 'albanileria',
        color: 'bg-slate-50 text-slate-600',
        description: 'Construcción, refacciones, colocación de pisos y revestimientos.'
    },
    {
        name: 'Gas',
        icon: Lightbulb,
        slug: 'gas',
        color: 'bg-orange-50 text-orange-600',
        description: 'Instalaciones de gas, reparación de estufas, cocinas y termotanques.'
    },
    {
        name: 'Soporte Técnico',
        icon: Monitor,
        slug: 'soporte-tecnico',
        color: 'bg-indigo-50 text-indigo-600',
        description: 'Reparación de PC, notebooks, redes y configuración de software.'
    },
    {
        name: 'Cadetería',
        icon: HardHat,
        slug: 'cadeteria',
        color: 'bg-red-50 text-red-600',
        description: 'Envíos rápidos, trámites y mensajería en moto.'
    },
    {
        name: 'Remis',
        icon: CarFront,
        slug: 'remis',
        color: 'bg-zinc-50 text-zinc-600',
        description: 'Traslados de pasajeros cómodos y seguros puerta a puerta.'
    },
    {
        name: 'Fletes y Mudanzas',
        icon: Truck,
        slug: 'fletes',
        color: 'bg-yellow-50 text-yellow-600',
        description: 'Transporte de cargas, mudanzas locales y larga distancia.'
    },
];

export default async function CategoriesPage() {
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
                    {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon || Layout;
                        return (
                            <Link
                                key={cat.slug}
                                href={`/ search ? category = ${ cat.slug } `}
                                className="group at-card p-8 border-none bg-white hover:ring-4 hover:ring-indigo-50 transition-all duration-500 block relative overflow-hidden"
                            >
                                {/* Decorative background element */}
                                <div className="absolute -right-4 -bottom-4 text-indigo-50/30 group-hover:text-indigo-100/50 transition-colors duration-500 transform scale-150 rotate-12">
                                    <IconComponent size={120} />
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className={`w - 14 h - 14 rounded - 2xl flex items - center justify - center ${ cat.color } group - hover: scale - 110 transition - all duration - 500 shadow - sm`}>
                                        <IconComponent size={28} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-black text-slate-900 text-xl tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                            {cat.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {cat.description}
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
