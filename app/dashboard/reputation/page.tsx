'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Star, TrendingUp, Award, MessageSquare, ChevronRight, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ReputationPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        averageRating: 0,
        totalReviews: 0,
        completedJobs: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        fetchReputationData();
    }, []);

    const fetchReputationData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all reviews for services owned by this provider
        const { data: reviewsData } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles!reviews_client_id_fkey(*),
                services(title)
            `)
            .eq('services.user_id', user.id)
            .order('created_at', { ascending: false });

        // Fetch completed jobs count
        const { count: completedCount } = await supabase
            .from('hires')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', user.id)
            .eq('status', 'completed');

        if (reviewsData && reviewsData.length > 0) {
            // Calculate metrics
            const totalReviews = reviewsData.length;
            const averageRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

            // Calculate rating distribution
            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviewsData.forEach(r => {
                distribution[r.rating as keyof typeof distribution]++;
            });

            setMetrics({
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews,
                completedJobs: completedCount || 0,
                ratingDistribution: distribution
            });
            setReviews(reviewsData);
        } else {
            setMetrics(prev => ({ ...prev, completedJobs: completedCount || 0 }));
        }

        setLoading(false);
    };

    const getStarPercentage = (stars: number) => {
        if (metrics.totalReviews === 0) return 0;
        return (metrics.ratingDistribution[stars as keyof typeof metrics.ratingDistribution] / metrics.totalReviews) * 100;
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen py-12">
            <div className="max-w-6xl mx-auto px-6">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">Panel</Link>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="text-slate-900 font-bold">Mi Reputación</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mi Reputación</h1>
                        <p className="text-slate-500 mt-1">Mirá cómo te califican tus clientes.</p>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-40 animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* Average Rating */}
                            <div className="bg-gradient-to-br from-amber-50 to-white rounded-[32px] border border-amber-100 p-8 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                        <Star size={28} fill="currentColor" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Promedio</p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900">{metrics.averageRating.toFixed(1)}</span>
                                    <span className="text-2xl font-bold text-slate-400">/ 5</span>
                                </div>
                                <div className="flex gap-1 mt-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i <= metrics.averageRating ? "currentColor" : "none"}
                                            className={i <= metrics.averageRating ? "text-amber-400" : "text-slate-200"}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Total Reviews */}
                            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[32px] border border-indigo-100 p-8 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <MessageSquare size={28} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Opiniones</p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900">{metrics.totalReviews}</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-4 font-medium">Calificaciones recibidas</p>
                            </div>

                            {/* Completed Jobs */}
                            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-[32px] border border-emerald-100 p-8 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                        <Award size={28} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Trabajos</p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900">{metrics.completedJobs}</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-4 font-medium">Completados exitosamente</p>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        {metrics.totalReviews > 0 && (
                            <div className="bg-white rounded-[32px] border border-slate-100 p-8 mb-10 shadow-sm">
                                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Distribución de Calificaciones</h2>
                                <div className="space-y-4">
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 w-20">
                                                <span className="text-sm font-bold text-slate-700">{stars}</span>
                                                <Star size={14} fill="currentColor" className="text-amber-400" />
                                            </div>
                                            <div className="flex-grow bg-slate-100 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${getStarPercentage(stars)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-slate-500 w-16 text-right">
                                                {metrics.ratingDistribution[stars as keyof typeof metrics.ratingDistribution]} ({getStarPercentage(stars).toFixed(0)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Todas las Opiniones</h2>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 flex flex-col md:flex-row gap-6">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                                                    {review.profiles?.avatar_url ? (
                                                        <img src={review.profiles.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="" />
                                                    ) : (
                                                        <User size={24} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-grow space-y-3">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-black text-slate-800">{review.profiles?.full_name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">Servicio: {review.services?.title}</p>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                fill={i <= review.rating ? "currentColor" : "none"}
                                                                className={i <= review.rating ? "text-amber-400" : "text-slate-200"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-slate-600 leading-relaxed font-light">{review.comment}</p>
                                                )}
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                                                    <Calendar size={12} />
                                                    {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50/50 rounded-[24px] border border-slate-100/50">
                                    <div className="w-20 h-20 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-200 mx-auto mb-6">
                                        <MessageSquare size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Aún no tenés opiniones</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                        Cuando completes trabajos, tus clientes podrán dejarte calificaciones que aparecerán acá.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
