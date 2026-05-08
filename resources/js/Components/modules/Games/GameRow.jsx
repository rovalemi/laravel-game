import { Link, router } from '@inertiajs/react';
import { Badge, Button } from '@/Components/ui';

export default function GameRow({ game, onDeleteRequest, onEditRequest }) {

    const togglePublish = () => {
        router.patch(route('manager.games.toggle-publish', game.slug));
    };

    return (
        <tr className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">

            {/* Thumbnail + título */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">

                    {/* Thumbnail */}
                    <div className="w-12 h-10 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {game.thumbnail_path ? (
                            <img
                                src={`/storage/${game.thumbnail_path}`}
                                alt={game.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-lg text-zinc-700">◆</span>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <p className="text-sm font-medium text-zinc-100 truncate">
                            {game.title}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {game.url}
                        </p>
                    </div>
                </div>
            </td>

            {/* Estado */}
            <td className="px-5 py-3">
                <Badge variant={game.published ? 'green' : 'gray'}>
                    {game.published ? 'Publicado' : 'Borrador'}
                </Badge>
            </td>

            {/* Fecha */}
            <td className="px-5 py-3 text-xs text-zinc-500">
                {new Date(game.created_at).toLocaleDateString('es-ES')}
            </td>

            {/* Acciones */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-2 justify-end">

                    {/* Publicar / Despublicar */}
                    <Button
                        size="sm"
                        variant={game.published ? 'ghost' : 'success'}
                        onClick={togglePublish}
                    >
                        {game.published ? 'Despublicar' : 'Publicar'}
                    </Button>

                    {/* Vista previa (usa slug) */}
                    <Link href={route('manager.games.preview', game.slug)}>
                        <Button size="sm" variant="ghost">
                            Vista previa
                        </Button>
                    </Link>

                    {/* Editar (abre modal) */}
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEditRequest(game)}
                    >
                        Editar
                    </Button>

                    {/* Eliminar (abre modal) */}
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDeleteRequest(game)}
                    >
                        Eliminar
                    </Button>
                </div>
            </td>
        </tr>
    );
}
