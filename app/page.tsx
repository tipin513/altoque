import Link from 'next/link';
import Image from 'next/image';
import {
  Wrench, PaintBucket, Droplets, Hammer, Zap, Monitor, Lightbulb, ShieldCheck,
  Clock, ChevronRight, Star, ArrowRight, CheckCircle2, MapPin, HardHat, CarFront, Truck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';

import HeroSearch from '@/components/HeroSearch';
import DynamicHeroTitle from '@/components/DynamicHeroTitle';

const CATEGORIES = [
  { name: 'Aire Acondicionado', icon: Wrench, slug: 'aire-acondicionado', color: 'bg-blue-50 text-blue-600' },
  { name: 'Electricidad', icon: Zap, slug: 'electricidad', color: 'bg-amber-50 text-amber-600' },
  { name: 'Plomería', icon: Droplets, slug: 'plomeria', color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Pintura', icon: PaintBucket, slug: 'pintura', color: 'bg-rose-50 text-rose-600' },
  { name: 'Limpieza', icon: CheckCircle2, slug: 'limpieza', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Albañilería', icon: Hammer, slug: 'albanileria', color: 'bg-slate-50 text-slate-600' },
  { name: 'Gas', icon: Lightbulb, slug: 'gas', color: 'bg-orange-50 text-orange-600' },
  { name: 'Soporte Técnico', icon: Monitor, slug: 'soporte-tecnico', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Cadetería', icon: HardHat, slug: 'cadeteria', color: 'bg-red-50 text-red-600' },
  { name: 'Remis', icon: CarFront, slug: 'remis', color: 'bg-zinc-50 text-zinc-600' },
  { name: 'Fletes y Mudanzas', icon: Truck, slug: 'fletes', color: 'bg-yellow-50 text-yellow-600' },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from('services')
    .select('*, categories(name), locations(city, province), service_images(image_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden bg-white pt-20 pb-28">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-3xl opacity-60"></div>

        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest">
                <Star size={12} fill="currentColor" />
                <span>La red #1 de Argentina</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                ¿Necesitás un <br />
                <DynamicHeroTitle /> <br />
                <span className="text-slate-900">sin vueltas?</span>
              </h1>

              <p className="text-xl text-slate-500 leading-relaxed max-w-[480px]">
                Conectamos a clientes con profesionales verificados en minutos. Rápido, seguro y con precios claros.
              </p>

              <div className="pt-2">
                <HeroSearch />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                      <Image
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="User"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">+500 Profesionales</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span>4.9/5 Calificación promedio</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"
                  alt="Servicios profesionales"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                {/* Floating Card 1 */}
                <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 animate-bounce shadow-indigo-500/10" style={{ animationDuration: '3s' }}>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Electricista matriculado</p>
                    <p className="text-[10px] text-slate-500">Llegando en 15 min</p>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 shadow-indigo-500/10">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden relative">
                      <Image src="https://i.pravatar.cc/100?img=33" alt="User" fill className="object-cover" sizes="32px" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden relative">
                      <Image src="https://i.pravatar.cc/100?img=12" alt="User" fill className="object-cover" sizes="32px" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold z-10 relative">
                      +12
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Presupuestos recibidos</p>
                    <p className="text-[10px] text-slate-500">En la última hora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Living Cards Redesign */}
      <section className="bg-slate-50 py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
                <Star size={12} fill="currentColor" />
                Explorá por rubros
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">¿Qué necesitás hoy?</h2>
              <p className="text-slate-500 mt-3 text-lg max-w-lg">Encontrá al profesional ideal para cada rincón de tu hogar o empresa.</p>
            </div>

            <Link
              href="/categories"
              className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
            >
              Ver todas las categorías
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="relative bg-white p-8 rounded-[32px] flex flex-col items-center justify-center gap-5 text-center group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 border border-slate-100 hover:border-indigo-100 overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${cat.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>

                <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center ${cat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm relative z-10`}>
                  <cat.icon size={36} className="transition-transform duration-300 group-hover:scale-105" />
                </div>

                <div className="space-y-1 relative z-10">
                  <span className="block font-black text-slate-800 text-lg tracking-tight group-hover:text-indigo-900 transition-colors">
                    {cat.name}
                  </span>
                  <div className="h-0.5 w-0 bg-indigo-500 mx-auto rounded-full group-hover:w-8 transition-all duration-300 delay-75"></div>
                </div>

                <div className="absolute top-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-white">
        <div className="max-w-[1240px] mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 mb-12 leading-tight">
            Últimos <span className="text-indigo-600 italic">destacados</span> del mes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services?.map((s: any) => (
              <Link key={s.id} href={`/service/${s.id}`} className="at-card group overflow-hidden border-none flex flex-col h-full bg-white">
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  <Image
                    src={s.service_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={s.title}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-indigo-600 shadow-sm uppercase border border-white/50">
                      {s.categories?.name}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors mb-4 min-h-[44px]">
                    {s.title}
                  </h3>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-slate-900">
                        {formatPrice(s.price_from)}
                      </p>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-slate-400">5.0</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                      <MapPin size={14} className="text-slate-300" />
                      <span>{s.locations?.city}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900 text-white py-24 rounded-[40px] mx-6 mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px]"></div>
        <div className="max-w-[1240px] mx-auto px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-cyan-400 border border-white/10">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold">Seguridad Total</h3>
              <p className="text-slate-400 font-light">Validamos a todos los prestadores para que tu única preocupación sea disfrutar el resultado.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 border border-white/10">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold">Respuesta al Toque</h3>
              <p className="text-slate-400 font-light">Sabemos que tu tiempo vale. Los profesionales te responden en tiempo récord.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 border border-white/10">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold">Garantía de Calidad</h3>
              <p className="text-slate-400 font-light">Si el servicio no era lo que esperabas, tenés nuestro soporte para solucionarlo.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
