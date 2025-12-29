import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, List, MessageSquare, User, Settings, Briefcase, Activity, TrendingUp, LogOut, Home, Star } from 'lucide-react';
import NotificationBadge from '@/components/NotificationBadge';
import JobsBadge from '@/components/JobsBadge';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const isPrestador = profile?.role === 'prestador';

    const sidebarLinks = [
        { name: 'Inicio', icon: Home, href: '/dashboard' },
        { name: 'Perfil', icon: User, href: '/dashboard/profile' },
        { name: 'Contrataciones', icon: Activity, href: '/dashboard/my-hires' },
        ...(isPrestador ? [{ name: 'Trabajos', icon: Briefcase, href: '/dashboard/my-jobs', badge: true }] : []),
        { name: 'Publicaciones', icon: List, href: '/dashboard/my-services' },
        { name: 'Mensajes', icon: MessageSquare, href: '/dashboard/messages', notification: true },
        ...(isPrestador ? [{ name: 'Reputación', icon: TrendingUp, href: '/dashboard/reputation' }] : []),
        { name: 'Configuración', icon: Settings, href: '/dashboard/settings' },
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-72 bg-white border-r border-slate-100 min-h-screen sticky top-0 hidden lg:block">
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Dashboard</h2>
                            <p className="text-sm text-slate-500 mt-1">Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}</p>
                        </div>

                        <nav className="space-y-2">
                            {sidebarLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-2xl transition-all group relative"
                                >
                                    <div className="relative">
                                        <item.icon size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        {item.badge && <JobsBadge />}
                                        {item.notification && <NotificationBadge />}
                                    </div>
                                    <span className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <form action="/auth/signout" method="post">
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all group">
                                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold">Cerrar sesión</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-12">
                    <div className="max-w-6xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                                ¡Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}! 👋
                            </h1>
                            <p className="text-slate-500 text-lg">Bienvenido a tu panel de control.</p>
                        </header>

                        {/* Profile Completion Warning */}
                        {isPrestador && (
                            (() => {
                                const isBusiness = profile?.provider_type === 'business';
                                const missingBusiness = isBusiness && (!profile?.cuit || !profile?.fiscal_address || !profile?.legal_name);
                                const missingIndependent = !isBusiness && (!profile?.bio || !profile?.phone); // Phone is usually required in signup but good to double check

                                if (missingBusiness || missingIndependent) {
                                    return (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 flex items-start gap-4 shadow-sm">
                                            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                                                <Settings size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-amber-900 mb-1">
                                                    ⚠️ Tu perfil está incompleto
                                                </h3>
                                                <p className="text-amber-700 text-sm mb-4">
                                                    {isBusiness
                                                        ? "Para poder publicar servicios, necesitamos que completes tu Documentación Legal (CUIT, Dirección Fiscal, Razón Social)."
                                                        : "Para destacar más, te recomendamos completar tu Bio y asegurar que tus datos de contacto estén actualizados."}
                                                </p>
                                                <Link href="/dashboard/profile" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors text-sm">
                                                    Completar Perfil ahora
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()
                        )}

                        {/* Quick Actions */}
                        {isPrestador ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                <Link href="/dashboard/new-service" className="bg-gradient-to-br from-indigo-50 to-white rounded-[32px] border border-indigo-100 p-8 hover:shadow-xl transition-all group">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-200">
                                        <PlusCircle size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Publicar Servicio</h3>
                                    <p className="text-slate-500 text-sm">Subí un nuevo servicio al marketplace</p>
                                </Link>

                                <Link href="/dashboard/my-services" className="bg-gradient-to-br from-emerald-50 to-white rounded-[32px] border border-emerald-100 p-8 hover:shadow-xl transition-all group">
                                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
                                        <List size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mis Servicios</h3>
                                    <p className="text-slate-500 text-sm">Gestioná tus publicaciones activas</p>
                                </Link>

                                <Link href="/dashboard/my-jobs" className="bg-gradient-to-br from-amber-50 to-white rounded-[32px] border border-amber-100 p-8 hover:shadow-xl transition-all group relative">
                                    <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-200 relative">
                                        <Briefcase size={28} />
                                        <JobsBadge />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mis Trabajos</h3>
                                    <p className="text-slate-500 text-sm">Gestioná solicitudes de clientes</p>
                                </Link>

                                <Link href="/dashboard/reputation" className="bg-gradient-to-br from-purple-50 to-white rounded-[32px] border border-purple-100 p-8 hover:shadow-xl transition-all group">
                                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
                                        <Star size={28} fill="currentColor" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mi Reputación</h3>
                                    <p className="text-slate-500 text-sm">Mirá tus calificaciones y métricas</p>
                                </Link>

                                <Link href="/dashboard/messages" className="bg-gradient-to-br from-blue-50 to-white rounded-[32px] border border-blue-100 p-8 hover:shadow-xl transition-all group relative">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200 relative">
                                        <MessageSquare size={28} />
                                        <NotificationBadge />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mensajes</h3>
                                    <p className="text-slate-500 text-sm">Conversaciones con clientes</p>
                                </Link>

                                <Link href="/dashboard/my-hires" className="bg-gradient-to-br from-rose-50 to-white rounded-[32px] border border-rose-100 p-8 hover:shadow-xl transition-all group">
                                    <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-rose-200">
                                        <Activity size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mis Contrataciones</h3>
                                    <p className="text-slate-500 text-sm">Servicios que contrataste</p>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[32px] border border-indigo-100 p-10 text-center md:col-span-2">
                                    <div className="w-20 h-20 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
                                        <Briefcase size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3">¿Querés ofrecer tus servicios?</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                        Convertite en prestador y empezá a recibir consultas ahora mismo.
                                    </p>
                                    <button className="btn-primary px-10 py-4 rounded-2xl text-lg shadow-xl shadow-indigo-200">
                                        Activar perfil de prestador
                                    </button>
                                </div>

                                <Link href="/dashboard/my-hires" className="bg-gradient-to-br from-amber-50 to-white rounded-[32px] border border-amber-100 p-8 hover:shadow-xl transition-all group md:col-span-2">
                                    <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-amber-200">
                                        <Activity size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mis Contrataciones</h3>
                                    <p className="text-slate-500 text-sm">Servicios que contrataste y su estado</p>
                                </Link>

                                <Link href="/dashboard/messages" className="bg-gradient-to-br from-blue-50 to-white rounded-[32px] border border-blue-100 p-8 hover:shadow-xl transition-all group relative">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200 relative">
                                        <MessageSquare size={28} />
                                        <NotificationBadge />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mensajes</h3>
                                    <p className="text-slate-500 text-sm">Conversaciones con prestadores</p>
                                </Link>

                                <Link href="/dashboard/profile" className="bg-gradient-to-br from-slate-50 to-white rounded-[32px] border border-slate-100 p-8 hover:shadow-xl transition-all group">
                                    <div className="w-14 h-14 bg-slate-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                                        <User size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Mi Perfil</h3>
                                    <p className="text-slate-500 text-sm">Configurá tu información personal</p>
                                </Link>
                            </div>
                        )}

                        {/* Recent Activity / Stats */}
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Actividad Reciente</h2>
                                <Link href="/dashboard/messages" className="text-sm font-bold text-indigo-600 hover:underline">
                                    Ver todo
                                </Link>
                            </div>
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                                    <MessageSquare size={40} />
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    No tenés actividad reciente por ahora
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
