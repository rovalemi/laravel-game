/**
 * StatCard — tarjeta de métrica para dashboards
 *
 * Uso:
 *   <StatCard label="Usuarios totales" value={42} icon="◉" trend="+3 esta semana" />
 */
export default function StatCard({ label, value, icon, trend, color = 'violet' }) {
    const colors = {
        violet: 'text-violet-400',
        cyan:   'text-cyan-400',
        green:  'text-emerald-400',
        amber:  'text-amber-400',
        red:    'text-red-400',
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
                <span className={`text-2xl ${colors[color] ?? colors.violet}`}>{icon}</span>
            </div>
            <div>
                <p className="text-3xl font-extrabold text-zinc-100 leading-none">{value ?? '—'}</p>
                <p className="text-sm text-zinc-500 mt-1">{label}</p>
            </div>
            {trend && (
                <p className="text-xs text-zinc-600 border-t border-zinc-800 pt-3">{trend}</p>
            )}
        </div>
    );
}
