import { ShieldCheck, Award } from 'lucide-react';

interface TrustBadgeProps {
    type: 'identity' | 'professional';
    size?: number;
    showLabel?: boolean;
}

export default function TrustBadge({ type, size = 16, showLabel = false }: TrustBadgeProps) {
    if (type === 'identity') {
        return (
            <div className="flex items-center gap-1 text-emerald-600" title="Identidad Verificada (DNI validado)">
                <ShieldCheck size={size} fill="currentColor" className="text-emerald-100" />
                {showLabel && <span className="text-xs font-bold text-emerald-700">Identidad Verificada</span>}
            </div>
        );
    }

    if (type === 'professional') {
        return (
            <div className="flex items-center gap-1 text-amber-600" title="Matrícula/Profesional Verificado">
                <Award size={size} fill="currentColor" className="text-amber-100" />
                {showLabel && <span className="text-xs font-bold text-amber-700">Profesional Verificado</span>}
            </div>
        );
    }

    return null;
}
