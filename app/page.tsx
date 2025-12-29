import Link from 'next/link';
import {
  Wrench, PaintBucket, Droplets, Hammer, Zap, Monitor, Lightbulb, ShieldCheck,
  Clock, ChevronRight, Star, ArrowRight, CheckCircle2, MapPin
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';

const CATEGORIES = [
  { name: 'Aire Acondicionado', icon: Wrench, slug: 'aire-acondicionado', color: 'bg-blue-50 text-blue-600' },
  { name: 'Electricidad', icon: Zap, slug: 'electricidad', color: 'bg-amber-50 text-amber-600' },
  { name: 'Plomería', icon: Droplets, slug: 'plomeria', color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Pintura', icon: PaintBucket, slug: 'pintura', color: 'bg-rose-50 text-rose-600' },
  { name: 'Limpieza', icon: CheckCircle2, slug: 'limpieza', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Albañilería', icon: Hammer, slug: 'albanileria', color: 'bg-slate-50 text-slate-600' },
  { name: 'Gas', icon: Lightbulb, slug: 'gas', color: 'bg-orange-50 text-orange-600' },
  { name: 'Soporte Técnico', icon: Monitor, slug: 'soporte-tecnico', color: 'bg-indigo-50 text-indigo-600' },
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
      {/* Hero Section - Modern & Clean */}
      <section className="relative overflow-hidden bg-white pt-16 pb-24">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-[1240px] mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold">
                <Star size={14} fill="currentColor" />
                <span>La red de servicios #1 de Argentina</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Servicios a domicilio, <span className="text-indigo-600">sin vueltas.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-[500px]">
                Conectamos a los mejores profesionales con los clientes que los necesitan hoy mismo. Rápido, seguro y profesional.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/search" className="btn-primary py-4 px-10 text-lg rounded-2xl">
                  Encontrar un servicio
                  <ArrowRight size={20} />
                </Link>
                <Link href="/register?role=prestador" className="btn-secondary py-4 px-10 text-lg rounded-2xl">
                  Soy profesional
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[40px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"
                  alt="Servicios profesionales"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Card Style */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">¿Qué necesitás hoy?</h2>
              <p className="text-slate-500 mt-2">Explorá nuestras categorías más buscadas por los usuarios.</p>
            </div>
            <Link href="/categories" className="group flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
              Ver todas <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/search?category=${cat.slug}`}
                className="at-card p-8 flex flex-col items-center justify-center gap-4 text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <cat.icon size={32} />
                </div>
                <span className="font-bold text-slate-800 tracking-tight">{cat.name}</span>
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
                  <img
                    src={s.service_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
