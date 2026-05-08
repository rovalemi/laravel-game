import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, ConfirmModal } from '@/Components/shared';
import { GameCreateModal, GameEditModal, GameRow } from '@/Components/modules';
import { Pagination, EmptyState, Button } from '@/Components/ui';

export default function ManagerGamesIndex({ games }) {
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGame, setEditingGame] = useState(null);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('manager.games.destroy', toDelete.slug), {
            onFinish: () => {
                setDeleting(false);
                setToDelete(null);
            },
        });
    };

    return (
        <AppLayout title="Juegos">
            <Head title="Gestión de juegos" />

            <PageHeader
                title="Catálogo de juegos"
                subtitle={`${games.total} juego${games.total !== 1 ? 's' : ''} en el sistema`}
                action={
                    <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                        + Nuevo juego
                    </Button>
                }
            />

            {/* Modal Crear */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <GameCreateModal
                        onClose={() => setShowCreateModal(false)}
                    />
                </div>
            )}

            {/* Modal Editar */}
            {editingGame && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <GameEditModal
                        game={editingGame}
                        onClose={() => setEditingGame(null)}
                    />
                </div>
            )}

            {/* Lista */}
            {games.data.length === 0 ? (
                <EmptyState
                    icon="◆"
                    title="Sin juegos"
                    description="Aún no hay juegos creados."
                    action={
                        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                            + Nuevo juego
                        </Button>
                    }
                />
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Juego
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Creado
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.data.map(game => (
                                <GameRow
                                    key={game.id}
                                    game={game}
                                    onDeleteRequest={setToDelete}
                                    onEditRequest={setEditingGame}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination links={games.links} />

            {/* Modal Confirmación */}
            <ConfirmModal
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar juego"
                description={`¿Seguro que quieres eliminar "${toDelete?.title}"? Las sesiones asociadas también se eliminarán.`}
                confirmLabel="Sí, eliminar"
                processing={deleting}
                danger
            />
        </AppLayout>
    );
}
