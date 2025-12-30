'use client';

import Link from 'next/link';
import { Home, User, Activity, Briefcase, List, ShieldCheck, MessageSquare, TrendingUp, Settings, LogOut } from 'lucide-react';
import NotificationBadge from '@/components/NotificationBadge';
import JobsBadge from '@/components/JobsBadge';

interface DashboardSidebarProps {
    profile: any;
}

export default function DashboardSidebar({ profile }: DashboardSidebarProps) {
    const isPrestador = profile?.role === 'prestador';

    const sidebarLinks = [
        { name: 'Inicio', icon: Home, href: '/dashboard' },
        { name: 'Perfil', icon: User, href: '/dashboard/profile' },
        { name: 'Contrataciones', icon: Activity, href: '/dashboard/my-hires' },
        ...(isPrestador ? [{ name: 'Trabajos', icon: Briefcase, href: '/dashboard/my-jobs', badge: true }] : []),
        { name: 'Publicaciones', icon: List, href: '/dashboard/my-services' },
        { name: 'Insignias', icon: ShieldCheck, href: '/dashboard/verification' },
        { name: 'Mensajes', icon: MessageSquare, href: '/dashboard/messages', notification: true },
        ...(isPrestador ? [{ name: 'Reputación', icon: TrendingUp, href: '/dashboard/reputation' }] : []),
        { name: 'Configuración', icon: Settings, href: '/dashboard/settings' },
    ];

    return (
        <aside className="w-72 bg-white border-r border-slate-100 h-full overflow-y-auto hidden lg:block">
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
    );
}
