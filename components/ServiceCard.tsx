import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ServiceCardProps {
    id: string;
    title: string;
    price_from: number | null;
    location: string;
    category: string;
    image_url?: string;
}

export default function ServiceCard({ id, title, price_from, location, category, image_url }: ServiceCardProps) {
    return (
        <Link href={`/service/${id}`} className="ml-card flex flex-col md:flex-row h-auto md:h-48 group overflow-hidden">
            {/* Image */}
            <div className="w-full md:w-48 h-48 md:h-full bg-gray-100 flex-shrink-0">
                <img
                    src={image_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop'}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    alt={title}
                />
            </div>

            {/* Content */}
            <div className="flex-grow p-4 md:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg md:text-xl font-light text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {title}
                        </h3>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-gray-500">
                        <span>{category}</span>
                        <span className="mx-1">•</span>
                        <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{location}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-end md:justify-between">
                    <div>
                        {price_from ? (
                            <>
                                <p className="text-2xl font-normal text-gray-900">{formatPrice(price_from)}</p>
                                <p className="text-xs text-green-600 font-semibold uppercase">Precio orientativo</p>
                            </>
                        ) : (
                            <p className="text-sm font-semibold text-gray-500 uppercase">Consultar precio</p>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
                        <Star size={12} className="text-gray-300" />
                        <Star size={12} className="text-gray-300" />
                        <Star size={12} className="text-gray-300" />
                        <Star size={12} className="text-gray-300" />
                        <Star size={12} className="text-gray-300" />
                        <span>(Sin opiniones)</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
