'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, X, ExternalLink, RefreshCw, FileText, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminVerifications() {
    const supabase = createClient();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [debug, setDebug] = useState<any>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Fetch pending requests with user profile data
            const res = await supabase
                .from('verification_requests')
                .select(`
                    *,
                    profiles (full_name, email, avatar_url)
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            const { data, error } = res;

            // Debug info
            setDebug({
                fetch_count: data?.length,
                error: error,
                first_row: data?.[0],
                raw_data: data
            });

            if (error) throw error;
            if (!data) return;

            // Generate signed URLs for private images
            const requestsWithUrls = await Promise.all(data.map(async (req) => {
                try {
                    const signedDocs = await Promise.all((req.document_urls || []).map(async (path: string) => {
                        const { data } = await supabase.storage
                            .from('verification-docs')
                            .createSignedUrl(path, 3600); // 1 hour link
                        return data?.signedUrl || null;
                    }));
                    return { ...req, signedDocs };
                } catch (err) {
                    console.error('Error signing docs for req', req.id, err);
                    return { ...req, signedDocs: [], active_error: 'Error signing docs' };
                }
            }));

            setRequests(requestsWithUrls);
        } catch (error: any) {
            console.error('Error fetching requests:', error);
            setDebug((prev: any) => ({ ...prev, catch_error: error.message }));
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (request: any, approved: boolean) => {
        setProcessingId(request.id);
        try {
            const status = approved ? 'approved' : 'rejected';
            const profileField = request.type === 'identity' ? 'identity_status' : 'professional_status';
            const profileValue = approved ? 'verified' : 'rejected';

            // 1. Update Request Status
            await supabase
                .from('verification_requests')
                .update({ status })
                .eq('id', request.id);

            // 2. Update Profile Status
            if (approved) {
                await supabase
                    .from('profiles')
                    .update({
                        [profileField]: profileValue,
                        [`is_${request.type}_verified`]: true // Update legacy boolean flags too
                    })
                    .eq('id', request.user_id);
            } else {
                await supabase
                    .from('profiles')
                    .update({ [profileField]: profileValue })
                    .eq('id', request.user_id);
            }

            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== request.id));

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar estado');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-8">Cargando solicitudes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Verificaciones Pendientes</h1>
                    <p className="text-slate-500">Revisá y valida la identidad de los prestadores.</p>
                </div>
                <button onClick={fetchRequests} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <RefreshCw size={20} />
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">¡Todo al día!</h3>
                    <p className="text-slate-500">No hay solicitudes de verificación pendientes.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6">
                            {/* User Info */}
                            <div className="md:w-1/4 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden">
                                        {req.profiles?.avatar_url ? (
                                            <img src={req.profiles.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{req.profiles?.full_name}</p>
                                        <p className="text-xs text-slate-500">{req.profiles?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.type === 'identity' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {req.type === 'identity' ? 'Identidad' : 'Profesional'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {format(new Date(req.created_at), "d MMM, HH:mm", { locale: es })}
                                    </span>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="md:w-1/2 flex gap-4 overflow-x-auto py-2">
                                {req.signedDocs?.map((url: string, idx: number) => (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 group hover:border-indigo-500 transition-colors"
                                    >
                                        <img src={url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <ExternalLink className="text-white" size={20} />
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="md:w-1/4 flex flex-col justify-center gap-3 border-l border-slate-50 pl-6">
                                <button
                                    onClick={() => handleDecision(req, true)}
                                    disabled={!!processingId}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                >
                                    <Check size={18} /> Aprobar
                                </button>
                                <button
                                    onClick={() => handleDecision(req, false)}
                                    disabled={!!processingId}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                                >
                                    <X size={18} /> Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Debug Block */}
            <div className="mt-8 p-4 bg-slate-100 rounded text-xs font-mono overflow-auto border border-slate-300">
                <p className="font-bold mb-2">Debug Info:</p>
                <pre>{JSON.stringify(debug, null, 2)}</pre>
            </div>
        </div >
    );
}
