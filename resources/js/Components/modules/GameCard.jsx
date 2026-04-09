import { Link, router } from '@inertiajs/react';

import { Badge, Button } from '@/Components/ui';

export default function GameCard({ game, onDeleteRequest }) {
    const togglePublish = () => {
        router.patch(route('manager.games.toggle-publish', game.id));
    };

    return (
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors">

            {/* Thumbnail */}
            <div className="w-20 h-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                {game.thumbnail_path
                    ? <img src={`/storage/${game.thumbnail_path}`} alt={game.title} className="w-full h-full object-cover" />
                    : <span className="text-2xl text-zinc-700">◆</span>
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant={game.published ? 'green' : 'gray'}>
                        {game.published ? 'Publicado' : 'Borrador'}
                    </Badge>
                    <span className="text-xs text-zinc-600">#{game.id}</span>
                </div>
                <p className="text-sm font-semibold text-zinc-100 truncate">{game.title}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{game.description ?? 'Sin descripción'}</p>
                <p className="text-xs text-cyan-600 truncate mt-0.5" title={game.url}>{game.url}</p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    size="sm"
                    variant={game.published ? 'ghost' : 'success'}
                    onClick={togglePublish}
                >
                    {game.published ? 'Despublicar' : 'Publicar'}
                </Button>

                <Link href={route('manager.games.preview', game.id)}>
                    <Button size="sm" variant="ghost">Vista previa</Button>
                </Link>

                <Link href={route('manager.games.edit', game.id)}>
                    <Button size="sm" variant="secondary">Editar</Button>
                </Link>

                <Button size="sm" variant="danger" onClick={() => onDeleteRequest(game)}>
                    Eliminar
                </Button>
            </div>
        </div>
    );
}
