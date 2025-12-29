'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Briefcase, Clock, CheckCircle2, XCircle, ChevronRight, Search, Activity, Star } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import ReviewModal from '@/components/ReviewModal';

export default function MyHiresPage() {
    const supabase = createClient();
    const [hires, setHires] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedHire, setSelectedHire] = useState<any>(null);
    const [reviewedHireIds, setReviewedHireIds] = useState<Set<string>>(new Set());

    const fetchHires = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch hires
        const { data: hiresData, error } = await supabase
            .from('hires')
            .select(`
                *,
                service:services(*),
                provider:profiles!hires_provider_id_fkey(*)
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching hires:', error);
            setLoading(false);
            return;
        }

        // Fetch reviews to know which ones are already rated
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select('hire_id')
            .eq('client_id', user.id);

        const reviewedIds = new Set(reviewsData?.map(r => r.hire_id) || []);

        setReviewedHireIds(reviewedIds);
        setHires(hiresData || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchHires();

        const channel = supabase
            .channel('hires-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'hires' }, () => {
                fetchHires();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'accepted': return <CheckCircle2 size={16} />;
            case 'completed': return <CheckCircle2 size={16} />;
            case 'rejected': return <XCircle size={16} />;
            default: return null;
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
                            <span className="text-slate-900 font-bold">Mis Contrataciones</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Contrataciones</h1>
                        <p className="text-slate-500 mt-1">Gestiioná los servicios que solicitaste.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : hires.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        {hires.map((hire) => (
                            <div key={hire.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(hire.status)}`}>
                                            <StatusIcon status={hire.status} />
                                            {hire.status}
                                        </div>
                                        <span className="text-slate-400 font-medium text-[11px]">
                                            {format(new Date(hire.created_at), "d 'de' MMMM", { locale: es })}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {hire.service?.title}
                                    </h3>

                                    <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            {hire.provider?.avatar_url ? (
                                                <img src={hire.provider.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                                            ) : (
                                                <Briefcase size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Prestador</p>
                                            <p className="font-bold text-slate-700">{hire.provider?.full_name}</p>
                                        </div>
                                    </div>

                                    {hire.status === 'completed' && !reviewedHireIds.has(hire.id) && (
                                        <button
                                            onClick={() => setSelectedHire(hire)}
                                            className="w-full flex items-center justify-center gap-2 h-11 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all mb-4 shadow-lg shadow-amber-100"
                                        >
                                            <Star size={18} fill="currentColor" /> Calificar servicio
                                        </button>
                                    )}

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Precio</p>
                                            <p className="text-lg font-black text-slate-900">{formatPrice(hire.service?.price_from || 0)}</p>
                                        </div>
                                        <Link
                                            href={`/dashboard/messages?id=${hire.provider_id}`}
                                            className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Activity size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto mb-8 shadow-inner">
                            <Activity size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Aún no contrataste servicios</h2>
                        <p className="text-slate-500 max-w-sm mx-auto mb-10">
                            Cuando contrates un servicio profesional, vas a poder seguir el estado de tu pedido acá.
                        </p>
                        <Link href="/" className="btn-primary px-10 py-4 rounded-2xl inline-flex items-center gap-3 text-lg">
                            <Search size={20} />
                            Explorar servicios
                        </Link>
                    </div>
                )}
            </div>

            {selectedHire && (
                <ReviewModal
                    isOpen={!!selectedHire}
                    onClose={() => setSelectedHire(null)}
                    hireId={selectedHire.id}
                    serviceId={selectedHire.service_id}
                    serviceTitle={selectedHire.service?.title}
                    onSuccess={fetchHires}
                />
            )}
        </div>
    );
}
