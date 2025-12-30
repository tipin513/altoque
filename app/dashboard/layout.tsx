import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardContent from '@/components/DashboardContent';

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
        <div className="bg-[#f8fafc] h-screen w-full flex overflow-hidden">
            <DashboardSidebar profile={profile} />
            <main className="flex-1 relative flex flex-col h-full overflow-hidden">
                <DashboardContent>
                    {children}
                </DashboardContent>
            </main>
        </div>
    );
}
