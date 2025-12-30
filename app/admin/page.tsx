'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, ShieldCheck, List, Activity, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalServices: 0,
        pendingVerifications: 0,
        completedHires: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Count Users
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // Count Services
            const { count: servicesCount } = await supabase.from('services').select('*', { count: 'exact', head: true });

            // Count Pending Verifications
            const { count: pendingCount } = await supabase
                .from('verification_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Count Completed Hires
            const { count: hiresCount } = await supabase
                .from('hires')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed');

            setStats({
                totalUsers: usersCount || 0,
                totalServices: servicesCount || 0,
                pendingVerifications: pendingCount || 0,
                completedHires: hiresCount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Cargando métricas...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Panel de Control</h1>
                <p className="text-slate-500">Bienvenido al centro de operaciones de AlToque.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Usuarios Totales"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                />
                <MetricCard
                    title="Servicios Activos"
                    value={stats.totalServices}
                    icon={List}
                    color="bg-indigo-50 text-indigo-600"
                />
                <MetricCard
                    title="Verificaciones Pendientes"
                    value={stats.pendingVerifications}
                    icon={ShieldCheck}
                    color="bg-amber-50 text-amber-600"
                    href="/admin/verifications"
                />
                <MetricCard
                    title="Trabajos Completados"
                    value={stats.completedHires}
                    icon={CheckCircle2}
                    color="bg-emerald-50 text-emerald-600"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Accesos Rápidos</h2>
                    <div className="space-y-3">
                        <Link href="/admin/verifications" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="font-bold text-slate-700">Revisar Documentos</span>
                            </div>
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{stats.pendingVerifications}</span>
                        </Link>

                        <Link href="/admin/users" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <UserCheck size={20} />
                                </div>
                                <span className="font-bold text-slate-700">Administrar Usuarios</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, href }: any) {
    const Card = (
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );

    if (href) return <Link href={href}>{Card}</Link>;
    return Card;
}
