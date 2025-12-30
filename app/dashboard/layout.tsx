import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <div className="bg-[#f8fafc] min-h-screen flex">
            <DashboardSidebar profile={profile} />
            <main className="flex-1 w-full max-w-[100vw] overflow-hidden">
                {children}
            </main>
        </div>
    );
}
