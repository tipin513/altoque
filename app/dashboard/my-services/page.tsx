import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import MyServiceItem from '@/components/MyServiceItem';

export default async function MyServicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: services } = await supabase
        .from('services')
        .select(`
            *,
            categories(name),
            locations(province, city),
            service_images(image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="bg-[#f8fafc] min-h-screen py-16">
            <div className="max-w-[1240px] mx-auto px-6">

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            Mis Publicaciones
                        </h1>
                        <p className="text-slate-500 text-lg font-medium">Gestioná tus servicios activos y las consultas de los clientes.</p>
                    </div>
                    <Link href="/dashboard/new-service" className="btn-primary flex items-center gap-2 h-14 px-8 rounded-2xl shadow-lg shadow-indigo-100 whitespace-nowrap">
                        <PlusCircle size={20} />
                        Crear nueva publicación
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services && services.length > 0 ? (
                        services.map((s: any) => (
                            <MyServiceItem key={s.id} service={s} />
                        ))
                    ) : (
                        <div className="md:col-span-2 lg:col-span-3 at-card p-20 text-center space-y-6 border-2 border-dashed border-slate-200 bg-white/50">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-300">
                                <PlusCircle size={40} />
                            </div>
                            <div className="max-w-md mx-auto space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Todavía no publicaste nada</h3>
                                <p className="text-slate-500 font-medium">Dá el primer paso y empezá a ofrecer tus servicios a miles de personas.</p>
                            </div>
                            <Link href="/dashboard/new-service" className="btn-primary inline-flex mt-4 px-10 h-14 items-center rounded-2xl">
                                Publicar mi primer servicio
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
