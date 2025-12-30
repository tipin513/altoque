import Link from 'next/link';
import { Search, User, LogOut, PlusCircle, Bell, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import NotificationBadge from './NotificationBadge';
import JobsBadge from './JobsBadge';

export default async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="glass sticky top-0 z-50 border-b border-slate-200/50 h-20 flex items-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <div className="max-w-[1240px] mx-auto w-full px-6 flex items-center justify-between gap-8">

                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                        <span className="text-white font-black text-xl">A</span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                        altoque<span className="text-indigo-600">.</span>
                    </span>
                </Link>

                {/* Search Bar */}
                <div className="flex-grow max-w-xl hidden md:block">
                    <form action="/search" method="GET" className="relative group">
                        <input
                            type="text"
                            name="q"
                            placeholder="¿Qué servicio estás buscando?"
                            className="w-full h-11 pl-12 pr-4 bg-slate-100/80 rounded-2xl border border-transparent focus:border-indigo-300 focus:bg-white focus:shadow-md outline-none transition-all placeholder:text-slate-400 text-slate-700 text-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    </form>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                    {user ? (
                        <div className="flex items-center gap-2 bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
                            {/* Profile Link */}
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 py-1.5 px-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-700 hover:text-indigo-600 group relative"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <User size={16} />
                                </div>
                                <JobsBadge />
                                <span className="text-sm font-bold hidden sm:inline">
                                    {user.user_metadata?.full_name?.split(' ')[0] || 'Hola'}
                                </span>
                            </Link>

                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            {/* Inbox Link */}
                            <Link
                                href="/dashboard/messages"
                                className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all group relative"
                                title="Mensajes"
                            >
                                <div className="relative">
                                    <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                                    <NotificationBadge initialUserId={user.id} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter mt-0.5">Mensajes</span>
                            </Link>

                            <div className="w-px h-6 bg-slate-200 mx-1"></div>

                            {/* Sign Out */}
                            <form action="/auth/signout" method="post" className="flex items-center">
                                <button
                                    type="submit"
                                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm rounded-xl transition-all cursor-pointer"
                                    title="Cerrar sesión"
                                >
                                    <LogOut size={20} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors">
                                Ingresar
                            </Link>
                            <Link href="/signup" className="btn-primary py-2.5 px-6 text-sm rounded-xl shadow-indigo-100">
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
