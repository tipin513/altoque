'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBadge({ initialUserId }: { initialUserId?: string }) {
    const supabase = createClient();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let userId: string | null = initialUserId || null;

        async function init() {
            if (!userId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                userId = user.id;
            }

            // Fetch initial unread count
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false)
                .neq('sender_id', userId);

            setUnreadCount(count || 0);

            // Subscribe to new messages with UNIQUE channel name to prevent collision
            // between Header and Sidebar instances
            const channelId = `unread-${userId}-${Math.random().toString(36).substring(7)}`;
            const channel = supabase
                .channel(channelId)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                }, (payload) => {
                    // Only increment if I'm not the sender
                    if (payload.new.sender_id !== userId) {
                        setUnreadCount(prev => prev + 1);
                    }
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages'
                }, () => {
                    // Re-fetch when ANY message is updated
                    if (userId) refreshCount(userId);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }

        async function refreshCount(id: string) {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false)
                .neq('sender_id', id);
            setUnreadCount(count || 0);
        }

        init();
    }, [initialUserId]);

    if (unreadCount === 0) return null;

    return (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm border border-white animate-in zoom-in duration-300 pointer-events-none">
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    );
}
