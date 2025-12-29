'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';

export default function MyJobsPage() {
    const supabase = createClient();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchJobs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('hires')
            .select(`
                *,
                service:services(*),
                client:profiles!hires_client_id_fkey(*)
            `)
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching jobs:', error);
        else setJobs(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchJobs();

        const channel = supabase
            .channel('jobs-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'hires' }, () => {
                fetchJobs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const { error } = await supabase
            .from('hires')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) console.error('Error updating job status:', error);
        else fetchJobs();
        setUpdatingId(null);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-6">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">Panel</Link>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-slate-900 font-bold">Mis Trabajos</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Trabajos</h1>
                        <p className="text-slate-500 mt-1">Gestioná las solicitudes de tus clientes.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(job.status)}`}>
                                            {job.status}
                                        </div>
                                        <span className="text-slate-400 font-medium text-[11px]">
                                            {format(new Date(job.created_at), "d 'de' MMMM", { locale: es })}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {job.service?.title}
                                    </h3>

                                    <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            {job.client?.avatar_url ? (
                                                <img src={job.client.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                                            ) : (
                                                <Briefcase size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cliente</p>
                                            <p className="font-bold text-slate-700">{job.client?.full_name}</p>
                                        </div>
                                    </div>

                                    {job.status === 'pending' && (
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <button
                                                onClick={() => updateStatus(job.id, 'accepted')}
                                                disabled={updatingId === job.id}
                                                className="flex items-center justify-center gap-2 h-11 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                            >
                                                {updatingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Aceptar</>}
                                            </button>
                                            <button
                                                onClick={() => updateStatus(job.id, 'rejected')}
                                                disabled={updatingId === job.id}
                                                className="flex items-center justify-center gap-2 h-11 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                                            >
                                                {updatingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <><X size={18} /> Rechazar</>}
                                            </button>
                                        </div>
                                    )}

                                    {job.status === 'accepted' && (
                                        <button
                                            onClick={() => updateStatus(job.id, 'completed')}
                                            disabled={updatingId === job.id}
                                            className="w-full flex items-center justify-center gap-2 h-11 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all mb-4 shadow-lg shadow-emerald-100"
                                        >
                                            {updatingId === job.id ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Marcar como completado</>}
                                        </button>
                                    )}

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Presupuesto</p>
                                            <p className="text-lg font-black text-slate-900">{formatPrice(job.service?.price_from || 0)}</p>
                                        </div>
                                        <Link
                                            href={`/dashboard/messages?id=${job.client_id}`}
                                            className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <MessageSquare size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto mb-8 shadow-inner">
                            <Briefcase size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Aún no tenés solicitudes de trabajo</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-10">
                            Cuando un cliente contrate tus servicios, vas a recibir una notificación y la solicitud aparecerá acá.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
