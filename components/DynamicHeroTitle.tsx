'use client';

import { useState, useEffect } from 'react';

const WORDS = ['Plomero', 'Electricista', 'Gasista', 'Pintor', 'Albañil', 'Técnico'];

export default function DynamicHeroTitle() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-block relative">
            <span className="text-indigo-600 transition-all duration-500 transform block">
                {WORDS[index]}
            </span>
            <span className="absolute -bottom-2 left-0 w-full h-3 bg-indigo-200/50 -rotate-2 -z-10 rounded-full"></span>
        </span>
    );
}
