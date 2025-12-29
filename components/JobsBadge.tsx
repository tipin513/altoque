'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function JobsBadge() {
    const supabase = createClient();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        let userId: string | null = null;

        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            userId = user.id;

            // Fetch initial pending count as provider
            const fetchCount = async () => {
                const { count } = await supabase
                    .from('hires')
                    .select('*', { count: 'exact', head: true })
                    .eq('provider_id', user.id)
                    .eq('status', 'pending');
                setPendingCount(count || 0);
            };

            fetchCount();

            // Subscribe to hiring changes
            const channel = supabase
                .channel('jobs-notifications')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'hires'
                }, () => {
                    fetchCount();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }

        init();
    }, []);

    if (pendingCount === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-white animate-in zoom-in duration-300">
            {pendingCount > 9 ? '9+' : pendingCount}
        </span>
    );
}
