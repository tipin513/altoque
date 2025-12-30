'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function ContactButton({
    providerId,
    providerName,
    serviceTitle
}: {
    providerId: string,
    providerName: string,
    serviceTitle: string
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleContact = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?next=/service/' + window.location.pathname.split('/').pop());
                return;
            }

            if (user.id === providerId) {
                alert("No podés enviarte mensajes a vos mismo.");
                setLoading(false);
                return;
            }

            // Check if conversation exists
            const { data: existingConvs, error: fetchError } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${providerId}),and(participant1_id.eq.${providerId},participant2_id.eq.${user.id})`)
                .single();

            if (existingConvs) {
                // Conversation exists, redirect
                router.push(`/dashboard/messages?chat=${existingConvs.id}`);
            } else {
                // Create new conversation
                // For simplicity, we ensure participant1 is always the smaller ID or just current user,
                // but our RLS allows inserting if we are one of them.
                // The unique constraint (participant1_id, participant2_id) might fail if we don't order them if we enforce strict order in DB.
                // But my SQL script didn't enforce strict order in CHECK constraints, just UNIQUE.
                // However, to be safe against the UNIQUE(p1, p2) constraint if it assumes p1 < p2 or similar, 
                // we should check if I defined the constraint as (least, greatest).
                // Looking back at my SQL: CONSTRAINT unique_participants UNIQUE (participant1_id, participant2_id)
                // This implies strict (p1, p2) combo. So A-B is different from B-A unless I normalize.
                // It's better to try both or normalize in app.
                // Let's normalize: p1 < p2.

                const [p1, p2] = [user.id, providerId].sort();

                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert({ participant1_id: p1, participant2_id: p2 })
                    .select()
                    .single();

                if (createError) {
                    // Check if it failed due to existing reverse pair (shouldn't if valid UUID sort)
                    // Or if race condition.
                    console.error('Error creating conversation:', createError);
                    alert('Error al iniciar conversación');
                } else {
                    // Optimistically send a first message about the service
                    await supabase.from('messages').insert({
                        conversation_id: newConv.id,
                        sender_id: user.id,
                        content: `Hola ${providerName}, vi tu servicio "${serviceTitle}" y me interesa.`
                    });

                    router.push(`/dashboard/messages?chat=${newConv.id}`);
                }
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleContact}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 className="animate-spin" /> : <MessageSquare size={20} />}
            Contactar Prestador
        </button>
    );
}
