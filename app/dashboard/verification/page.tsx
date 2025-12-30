'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Upload, AlertCircle, CheckCircle, Clock, FileText, Camera, X } from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'identity' | 'professional'>('identity');

    // Upload State
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (files.length + newFiles.length > 2) {
                setErrorMsg('Máximo 2 fotos (Frente y Dorso)');
                return;
            }
            setFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
            setErrorMsg(null);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setErrorMsg('Por favor, subí al menos una foto del documento.');
            return;
        }

        setUploading(true);
        setErrorMsg(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const uploadedUrls: string[] = [];

            // 1. Upload files to private bucket
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}_${activeTab}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('verification-docs')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Store path/key instead of public URL for private buckets
                uploadedUrls.push(fileName);
            }

            // 2. Create Verification Request
            const { error: requestError } = await supabase
                .from('verification_requests')
                .insert({
                    user_id: user.id,
                    type: activeTab,
                    document_urls: uploadedUrls,
                    status: 'pending'
                });

            if (requestError) throw requestError;

            // 3. Update Profile Status temporarily to 'pending'
            const updateField = activeTab === 'identity' ? 'identity_status' : 'professional_status';
            await supabase.from('profiles').update({ [updateField]: 'pending' }).eq('id', user.id);

            setSuccessMsg('¡Documentación enviada! La revisaremos a la brevedad.');
            setFiles([]);
            setPreviewUrls([]);
            fetchProfile(); // Refresh status

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Error al subir documentos.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    const currentStatus = activeTab === 'identity' ? profile?.identity_status : profile?.professional_status;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Centro de Verificación</h1>
                <p className="text-slate-500">Gestioná tus insignias para generar más confianza en tus clientes.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Identity Card */}
                <button
                    onClick={() => { setActiveTab('identity'); setFiles([]); setPreviewUrls([]); setSuccessMsg(null); }}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden ${activeTab === 'identity' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-emerald-200'}`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Identidad</h3>
                            <p className="text-xs text-slate-500">DNI o Pasaporte</p>
                        </div>
                    </div>
                    <StatusBadge status={profile?.identity_status || 'unverified'} />
                </button>

                {/* Professional Card */}
                <button
                    onClick={() => { setActiveTab('professional'); setFiles([]); setPreviewUrls([]); setSuccessMsg(null); }}
                    className={`p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden ${activeTab === 'professional' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-amber-200'}`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Profesional</h3>
                            <p className="text-xs text-slate-500">Matrícula o Certificado</p>
                        </div>
                    </div>
                    <StatusBadge status={profile?.professional_status || 'unverified'} />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    {activeTab === 'identity' ? 'Verificar Identidad' : 'Verificar Título Profesional'}
                </h2>

                {/* Status Handling */}
                {currentStatus === 'verified' && (
                    <div className="bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-100">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 mb-2">¡Felicitaciones!</h3>
                        <p className="text-emerald-700 mb-6">Tu documentación ya fue verificada. Tu insignia está visible en tu perfil.</p>

                        <div className="flex justify-center text-sm text-emerald-600 gap-1">
                            <span>¿Necesitás actualizar tus documentos?</span>
                            <a href="mailto:soporte@altoque.com" className="font-bold underline hover:text-emerald-800">Contactar a Soporte</a>
                        </div>
                    </div>
                )}

                {currentStatus === 'pending' && (
                    <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-100">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-black text-amber-900 mb-2">En Revisión</h3>
                        <p className="text-amber-700 mb-6">Recibimos tus documentos. Te notificaremos cuando la revisión esté completa (24-48hs).</p>
                        <p className="text-xs text-amber-600 italic">No podés subir nuevos documentos mientras la revisión está en curso.</p>
                    </div>
                )}

                {/* Upload Area - Only visible if Unverified or Rejected */}
                {(currentStatus === 'unverified' || currentStatus === 'rejected' || !currentStatus) && (
                    <div className="space-y-6">
                        {currentStatus === 'rejected' && (
                            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex gap-3 text-rose-700 text-sm">
                                <AlertCircle className="flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-bold">Tu solicitud fue rechazada.</p>
                                    <p>Por favor revisá que las fotos sean legibles y correspondan a lo solicitado, y volvé a intentarlo.</p>
                                </div>
                            </div>
                        )}

                        <p className="text-slate-600 leading-relaxed">
                            {activeTab === 'identity'
                                ? 'Para obtener la insignia de Identidad Verificada, por favor subí una foto clara del frente y dorso de tu DNI.'
                                : 'Para la insignia Profesional, necesitamos una foto de tu credencial, matrícula o certificado habilitante.'}
                        </p>

                        <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-8 text-center hover:bg-slate-50 transition-colors relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileSelect}
                                disabled={uploading}
                            />
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Upload size={32} />
                            </div>
                            <p className="font-bold text-slate-900">Hacé click o arrastrá tus fotos acá</p>
                            <p className="text-sm text-slate-400 mt-1">Soporta JPG, PNG (Max 5MB)</p>
                        </div>

                        {/* Preview Section */}
                        {files.length > 0 && (
                            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative w-32 h-20 flex-shrink-0 group">
                                        <img src={url} className="w-full h-full object-cover rounded-xl border border-slate-200" />
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errorMsg && (
                            <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                                <AlertCircle size={18} /> {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                                <CheckCircle size={18} /> {successMsg}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={uploading || files.length === 0}
                                className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Subiendo...' : 'Enviar para Revisión'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        verified: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        rejected: 'bg-rose-100 text-rose-700',
        unverified: 'bg-slate-100 text-slate-500'
    };

    const labels: Record<string, string> = {
        verified: 'Verificado',
        pending: 'Pendiente',
        rejected: 'Rechazado',
        unverified: 'Sin verificar'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
