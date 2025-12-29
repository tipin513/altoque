import { createClient } from '@/lib/supabase/server';
import ServiceCard from '@/components/ServiceCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
    const { q, category, location } = await searchParams;
    const supabase = await createClient();

    // Build query with inner join for filtering if category exists
    let query = supabase
        .from('services')
        .select(`
            *,
            profiles(full_name),
            categories!inner(name, slug),
            locations(province, city),
            service_images(image_url)
        `)
        .eq('is_active', true);

    if (q) {
        query = query.ilike('title', `%${q}%`);
    }

    if (category) {
        query = query.eq('categories.slug', category);
    }

    const { data: services, error } = await query;

    return (
        <div className="bg-[#f5f5f5] min-h-screen py-8">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-6 font-light">
                    <Link href="/" className="hover:text-blue-600">Inicio</Link>
                    <ChevronRight size={12} />
                    <span>Servicios</span>
                    {category && (
                        <>
                            <ChevronRight size={12} />
                            <span className="capitalize">{category.replace(/-/g, ' ')}</span>
                        </>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1 capitalize">
                                {q || (category ? category.replace(/-/g, ' ') : 'Todos los servicios')}
                            </h1>
                            <p className="text-sm text-gray-500">{services?.length || 0} resultados</p>
                        </div>

                        {/* Mock Filters */}
                        <div className="space-y-6 hidden lg:block">
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-bold text-sm mb-3">Ubicación</h4>
                                <ul className="text-sm space-y-2 text-gray-600">
                                    <li className="hover:text-blue-600 cursor-pointer">CABA</li>
                                    <li className="hover:text-blue-600 cursor-pointer">GBA Norte</li>
                                    <li className="hover:text-blue-600 cursor-pointer">Córdoba</li>
                                    <li className="hover:text-blue-600 cursor-pointer">Santa Fe</li>
                                </ul>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="font-bold text-sm mb-3">Precio</h4>
                                <ul className="text-sm space-y-2 text-gray-600 font-light">
                                    <li className="hover:text-blue-600 cursor-pointer">Hasta $30.000</li>
                                    <li className="hover:text-blue-600 cursor-pointer">$30.000 a $100.000</li>
                                    <li className="hover:text-blue-600 cursor-pointer">Más de $100.000</li>
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Results List */}
                    <main className="flex-grow space-y-4">
                        {services && services.length > 0 ? (
                            services.map((s: any) => (
                                <ServiceCard
                                    key={s.id}
                                    id={s.id}
                                    title={s.title}
                                    price_from={s.price_from}
                                    location={`${s.locations?.city}, ${s.locations?.province}`}
                                    category={s.categories?.name}
                                    image_url={s.service_images?.[0]?.image_url}
                                />
                            ))
                        ) : (
                            <div className="ml-card p-16 text-center space-y-4">
                                <div className="text-6xl">🔍</div>
                                <h2 className="text-xl font-bold text-gray-800">No encontramos resultados</h2>
                                <p className="text-gray-500 max-w-[300px] mx-auto text-sm">Prueba buscando con otras palabras o navegando por las <Link href="/categories" className="text-blue-600 hover:underline">categorías</Link>.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
