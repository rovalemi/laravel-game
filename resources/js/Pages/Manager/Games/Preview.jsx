import { Head, Link } from '@inertiajs/react';
import { Suspense, lazy } from 'react';

import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/shared/PageHeader';
import { Badge, Button } from '@/Components/ui';
import { internalGames } from '@/Pages/Games/internalGames';

export default function ManagerGamesPreview({ game }) {

    const InternalGame = game.component && internalGames[game.component]
        ? lazy(internalGames[game.component])
        : null;

    return (
        <AppLayout title="Vista previa">
            <Head title={`Vista previa: ${game.title}`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <span>{game.title}</span>
                        <Badge variant={game.published ? 'green' : 'gray'}>
                            {game.published ? 'Publicado' : 'Borrador'}
                        </Badge>
                    </div>
                }
                subtitle="Vista previa del gestor — así lo verá el jugador"
                action={
                    <div className="flex items-center gap-3">
                        <Link href={route('manager.games.index')}>
                            <Button variant="secondary" size="md" className="flex items-center gap-2">
                                ← Volver
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* CONTENEDOR DEL PREVIEW */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center p-6"
                 style={{ height: 'calc(100vh - 260px)' }}>

                {/* JUEGO EXTERNO */}
                {game.url && (
                    <iframe
                        src={game.url}
                        className="w-full h-full border-none rounded-xl"
                        title={`Vista previa: ${game.title}`}
                        allow="camera; microphone; fullscreen"
                    />
                )}

                {/* JUEGO INTERNO */}
                {InternalGame && (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-[900px] h-full max-h-[700px] flex items-center justify-center scale-[0.95] origin-center">
                            <Suspense fallback={<div className="p-10 text-zinc-500">Cargando juego interno…</div>}>
                                <InternalGame game={game} />
                            </Suspense>
                        </div>
                    </div>
                )}

                {/* ERROR */}
                {game.component && !InternalGame && (
                    <div className="p-10 text-red-500">
                        El componente <strong>{game.component}</strong> no existe en <code>/Pages/Games</code>.
                    </div>
                )}

                {/* SIN NADA */}
                {!game.url && !game.component && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <span className="text-4xl mb-3">◆</span>
                        <p className="text-sm">Este juego no tiene URL ni componente configurado.</p>
                        <Link href={route('manager.games.edit', game.slug)} className="mt-3">
                            <Button variant="secondary" size="sm">Configurar</Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
