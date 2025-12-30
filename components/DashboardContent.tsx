'use client';

import { usePathname } from 'next/navigation';

export default function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Check if we are in the messages page (exact or sub-route if any)
    const isMessages = pathname?.includes('/dashboard/messages');

    return (
        <div className={`flex-1 h-full ${isMessages ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {children}
        </div>
    );
}
