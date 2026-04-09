import { Head, Link } from '@inertiajs/react';

import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/shared/PageHeader';
import { EmptyState, Button } from '@/Components/ui';

export default function PlayerGamesIndex({ games }) {
    return (
        <AppLayout title="Juegos">
            <Head title="Jugar" />

            <PageHeader
                title="Elige tu juego"
                subtitle={`${games.length} juego${games.length !== 1 ? 's' : ''} disponible${games.length !== 1 ? 's' : ''}`}
            />

            {games.length === 0 ? (
                <EmptyState
                    icon="◆"
                    title="Sin juegos disponibles"
                    description="El gestor está preparando nuevos juegos. Vuelve pronto."
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {games.map(game => (
                        <div
                            key={game.id}
                            className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-violet-700 hover:-translate-y-1 transition-all duration-200"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-full aspect-video bg-zinc-950 overflow-hidden">
                                {game.thumbnail_path ? (
                                    <img
                                        src={`/storage/${game.thumbnail_path}`}
                                        alt={game.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-5xl text-zinc-800">◆</span>
                                    </div>
                                )}

                                {/* Overlay con botón play */}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Link href={route('player.games.play', game.id)}>
                                        <Button variant="primary" size="lg" className="shadow-xl shadow-violet-900/50">
                                            ▶ Jugar
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h3 className="font-semibold text-zinc-100 mb-1 truncate">{game.title}</h3>
                                {game.description && (
                                    <p className="text-sm text-zinc-500 line-clamp-2">{game.description}</p>
                                )}
                                <Link
                                    href={route('player.games.play', game.id)}
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-violet-600 text-zinc-300 hover:text-white transition-all duration-200"
                                >
                                    ▶ Jugar ahora
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
