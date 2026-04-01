/**
 * PageHeader — cabecera de página con título, subtítulo y acción opcional
 *
 * Uso:
 *   <PageHeader
 *     title="Gestión de Juegos"
 *     subtitle="12 juegos en el sistema"
 *     action={<Link href={...} className="...">+ Nuevo</Link>}
 *   />
 */
export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-start justify-between gap-4 mb-8">
            <div>
                <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
                {subtitle && (
                    <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
                )}
            </div>
            {action && (
                <div className="shrink-0">{action}</div>
            )}
        </div>
    );
}
