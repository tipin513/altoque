'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugRolePage() {
    const supabase = createClient();
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        check();
    }, []);

    const check = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        let profileData = null;
        let profileError = null;

        if (user) {
            const res = await supabase
                .from('profiles')
                .select('*') // Select ALL fields to see everything
                .eq('id', user.id);

            profileData = res.data;
            profileError = res.error;
        }

        setInfo({
            auth_user: user ? { id: user.id, email: user.email } : 'No Logged In',
            auth_error: authError,
            profile_query_result: profileData,
            profile_error: profileError
        });
    };

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug de Roles</h1>
            <pre className="bg-slate-100 p-4 rounded border border-slate-300 whitespace-pre-wrap">
                {JSON.stringify(info, null, 2)}
            </pre>
            <button onClick={check} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                Re-check
            </button>
        </div>
    );
}
