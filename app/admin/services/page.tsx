'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Power, PowerOff, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminServices() {
    const supabase = createClient();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*, profiles(full_name), categories(name)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setServices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (serviceId: string, currentState: boolean) => {
        setServices(services.map(s => s.id === serviceId ? { ...s, is_active: !currentState } : s));

        const { error } = await supabase
            .from('services')
            .update({ is_active: !currentState })
            .eq('id', serviceId);

        if (error) {
            console.error(error);
            alert('Error al actualizar servicio');
            fetchServices();
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900">Administrar Servicios</h1>

            <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-bold text-slate-600 text-sm">Título</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Prestador</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Categoría</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Estado</th>
                            <th className="p-4 font-bold text-slate-600 text-sm text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-medium text-slate-900">{service.title}</td>
                                <td className="p-4 text-sm text-slate-500">{service.profiles?.full_name}</td>
                                <td className="p-4 text-sm text-slate-500">{service.categories?.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${service.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {service.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <Link
                                        href={`/service/${service.id}`}
                                        target="_blank"
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                    <button
                                        onClick={() => toggleActive(service.id, service.is_active)}
                                        className={`p-2 rounded-lg transition-colors ${service.is_active
                                                ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'
                                                : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                        title={service.is_active ? "Desactivar" : "Activar"}
                                    >
                                        {service.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
