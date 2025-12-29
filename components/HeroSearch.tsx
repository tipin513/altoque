'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative max-w-lg w-full">
            <input
                type="text"
                placeholder="¿Qué servicio buscás hoy?"
                className="w-full h-16 pl-8 pr-20 bg-white rounded-2xl border-2 border-indigo-50 shadow-lg shadow-indigo-100 text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button
                type="submit"
                className="absolute right-2 top-2 h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200"
            >
                <Search size={24} />
            </button>
        </form>
    );
}
