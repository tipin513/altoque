'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, MoreVertical, Shield, ShieldOff, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminUsers() {
    const supabase = createClient();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Pagination needed for production

            if (error) throw error;
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'cliente' : 'admin';
        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            console.error(error);
            alert('Error al cambiar rol');
            fetchUsers(); // Revert
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-slate-900">Administrar Usuarios</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-bold text-slate-600 text-sm">Usuario</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Rol</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Tipo Proveedor</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Estado Verif.</th>
                            <th className="p-4 font-bold text-slate-600 text-sm text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                            {user.avatar_url && <img src={user.avatar_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{user.full_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                                        user.role === 'prestador' ? 'bg-slate-100 text-slate-700' : 'text-slate-500'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-500">{user.provider_type || '-'}</td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {user.is_identity_verified && <span title="Identidad Verificada">🛡️</span>}
                                        {user.is_professional_verified && <span title="Profesional Verificado">🎓</span>}
                                        {!user.is_identity_verified && !user.is_professional_verified && <span className="text-slate-300">-</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={async () => {
                                                const { data: { user: currentUser } } = await supabase.auth.getUser();
                                                if (!currentUser) return;

                                                // Simplified approach: Fetch all conversations involving current user, then find the correct one.
                                                // This avoids complex OR syntax errors in the API call.
                                                const { data: myConversations } = await supabase
                                                    .from('conversations')
                                                    .select('*')
                                                    .or(`participant1_id.eq.${currentUser.id},participant2_id.eq.${currentUser.id}`);

                                                const existing = myConversations?.find(c =>
                                                    (c.participant1_id === user.id || c.participant2_id === user.id)
                                                );

                                                if (existing) {
                                                    router.push(`/dashboard/messages?chat=${existing.id}`);
                                                } else {
                                                    // Create new support conversation
                                                    const [p1, p2] = [currentUser.id, user.id].sort();

                                                    const { data: newConv, error: createError } = await supabase
                                                        .from('conversations')
                                                        .insert({ participant1_id: p1, participant2_id: p2 })
                                                        .select()
                                                        .single();

                                                    if (newConv) {
                                                        // Send welcome msg
                                                        await supabase.from('messages').insert({
                                                            conversation_id: newConv.id,
                                                            sender_id: currentUser.id,
                                                            content: `Hola ${user.full_name}, te escribo desde el soporte de Altoque.`
                                                        });
                                                        router.push(`/dashboard/messages?chat=${newConv.id}`);
                                                    } else {
                                                        console.error('Error creating conversation:', createError);
                                                        // If error is duplicate key, it means it existed but we missed it?
                                                        // Assuming we caught most cases with the .find() above.
                                                        alert('Hubo un error al iniciar el chat. Por favor intente de nuevo.');
                                                    }
                                                }
                                            }}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Enviar mensaje"
                                        >
                                            <Mail size={18} />
                                        </button>

                                        <button
                                            onClick={() => toggleAdmin(user.id, user.role)}
                                            className={`p-2 rounded-lg transition-colors ${user.role === 'admin'
                                                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                                                }`}
                                            title={user.role === 'admin' ? "Quitar Admin" : "Hacer Admin"}
                                        >
                                            {user.role === 'admin' ? <Shield size={18} /> : <ShieldOff size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
