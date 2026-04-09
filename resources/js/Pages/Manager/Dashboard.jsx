import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import { StatCard, PageHeader } from '@/Components/shared';
import Badge from '@/Components/ui/Badge';

export default function ManagerDashboard({ stats = {}, recentGames = [] }) {
    const cards = [
        { label: 'Juegos publicados', value: stats.published ?? '—', icon: '◆', color: 'green' },
        { label: 'Juegos en borrador', value: stats.drafts ?? '—', icon: '◈', color: 'amber' },
        { label: 'Sesiones totales', value: stats.sessions ?? '—', icon: '⬡', color: 'cyan' },
        { label: 'Jugadores únicos', value: stats.players ?? '—', icon: '◉', color: 'violet' },
    ];

    return (
        <AppLayout title="Dashboard">
            <Head title="Gestor — Dashboard" />

            <PageHeader
                title="Panel del gestor"
                subtitle="Estado de tu catálogo de juegos"
                action={
                    <Link
                        href={route('manager.games.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                    >
                        + Nuevo juego
                    </Link>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {cards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Juegos recientes */}
            <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    Juegos recientes
                </h3>

                {recentGames.length === 0 ? (
                    <div className="text-center py-12 text-sm text-zinc-600 bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl">
                        Aún no has creado ningún juego.{' '}
                        <Link href={route('manager.games.create')} className="text-violet-400 hover:underline">
                            Crea el primero
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {recentGames.map(game => (
                            <div
                                key={game.id}
                                className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 hover:border-zinc-700 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl text-zinc-700 shrink-0">
                                    ◆
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-100 truncate">{game.title}</p>
                                    <p className="text-xs text-zinc-500 truncate">{game.url}</p>
                                </div>
                                <Badge variant={game.published ? 'green' : 'gray'}>
                                    {game.published ? 'Publicado' : 'Borrador'}
                                </Badge>
                                <Link
                                    href={route('manager.games.edit', game.id)}
                                    className="text-xs text-zinc-500 hover:text-violet-400 transition-colors ml-2 shrink-0"
                                >
                                    Editar
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
