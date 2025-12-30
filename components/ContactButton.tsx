import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import MessageModal from '@/components/MessageModal';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleContact = async () => {
        setLoading(true);
        // Check if user is logged in
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

        setLoading(false);
        setIsModalOpen(true);
    };

    return (
        <>
            <button
                onClick={handleContact}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : <MessageSquare size={20} />}
                Contactar Prestador
            </button>

            <MessageModal
                serviceId="" // Not needed for DB v1
                sellerId={providerId}
                serviceTitle={serviceTitle}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                defaultText={`Hola ${providerName}, vi tu servicio "${serviceTitle}" y me interesa.`}
            />
        </>
    );
}
