'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NotificationBadge() {
    const supabase = createClient();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let userId: string | null = null;

        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            userId = user.id;

            // Fetch initial unread count
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false)
                .neq('sender_id', userId);

            setUnreadCount(count || 0);

            // Subscribe to new messages
            const channel = supabase
                .channel('unread-notifications')
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
                    // Re-fetch when ANY message is updated (e.g. marked as read)
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
    }, []);

    if (unreadCount === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    );
}
