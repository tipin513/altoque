'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, ShieldCheck, List, LogOut, CheckCircle2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Check role in profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                router.push('/dashboard'); // Kick out if not admin
                return;
            }

            setIsAdmin(true);
        } catch (error) {
            console.error('Error checking admin:', error);
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Verificaciones', href: '/admin/verifications', icon: ShieldCheck },
        { name: 'Usuarios', href: '/admin/users', icon: Users },
        { name: 'Servicios', href: '/admin/services', icon: List },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-50 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-indigo-400 font-black text-xl">
                        <CheckCircle2 size={24} />
                        <span>AlToque Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-900/20 w-full transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                    <div className="px-4 py-4 text-xs text-slate-600 text-center">
                        <p>AlToque Admin v1.0</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
