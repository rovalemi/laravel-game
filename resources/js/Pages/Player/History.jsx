import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/shared/PageHeader';
import { EmptyState, Badge, Pagination } from '@/Components/ui';

const statusBadge = {
    completed: { variant: 'green', label: 'Completada' },
    active: { variant: 'blue', label: 'En curso' },
    abandoned: { variant: 'gray', label: 'Abandonada' },
};

function formatDuration(seconds) {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function PlayerHistory({ sessions }) {
    return (
        <AppLayout title="Mis partidas">
            <Head title="Historial de partidas" />

            <PageHeader
                title="Mis partidas"
                subtitle={`${sessions.total} sesión${sessions.total !== 1 ? 'es' : ''} jugada${sessions.total !== 1 ? 's' : ''}`}
                action={
                    <Link
                        href={route('player.games.index')}
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        ← Ver juegos
                    </Link>
                }
            />

            {sessions.data.length === 0 ? (
                <EmptyState
                    icon="◈"
                    title="Sin partidas aún"
                    description="Juega tu primera partida y aquí aparecerá tu historial."
                    action={
                        <Link href={route('player.games.index')}>
                            <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors">
                                Ir a jugar
                            </button>
                        </Link>
                    }
                />
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                {['Juego', 'Estado', 'Puntuación', 'Duración', 'Fecha'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.data.map(session => {
                                const st = statusBadge[session.status] ?? statusBadge.abandoned;
                                return (
                                    <tr key={session.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition-colors">
                                        {/* Juego */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm text-zinc-600 shrink-0">
                                                    ◆
                                                </div>
                                                <span className="text-sm font-medium text-zinc-200">
                                                    {session.game?.title ?? '—'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-5 py-3">
                                            <Badge variant={st.variant}>{st.label}</Badge>
                                        </td>

                                        {/* Puntuación */}
                                        <td className="px-5 py-3">
                                            <span className="text-sm font-mono font-semibold text-zinc-100">
                                                {session.score ?? '—'}
                                            </span>
                                        </td>

                                        {/* Duración */}
                                        <td className="px-5 py-3 text-sm text-zinc-400">
                                            {formatDuration(session.duration_seconds)}
                                        </td>

                                        {/* Fecha */}
                                        <td className="px-5 py-3 text-xs text-zinc-500">
                                            {formatDate(session.started_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination links={sessions.links} />
        </AppLayout>
    );
}
