import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, ConfirmModal } from '@/Components/shared';
import GameCard from '@/Components/modules/GameCard';
import { EmptyState, Pagination, Button } from '@/Components/ui';

export default function ManagerGamesIndex({ games }) {
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('manager.games.destroy', toDelete.id), {
            onFinish: () => { setDeleting(false); setToDelete(null); },
        });
    };

    return (
        <AppLayout title="Juegos">
            <Head title="Gestión de juegos" />

            <PageHeader
                title="Catálogo de juegos"
                subtitle={`${games.total} juego${games.total !== 1 ? 's' : ''} en el sistema`}
                action={
                    <Link href={route('manager.games.create')}>
                        <Button variant="primary">+ Nuevo juego</Button>
                    </Link>
                }
            />

            {games.data.length === 0 ? (
                <EmptyState
                    icon="◆"
                    title="Sin juegos"
                    description="Aún no hay juegos. Crea el primero y publícalo para que los jugadores puedan acceder."
                    action={
                        <Link href={route('manager.games.create')}>
                            <Button variant="primary">+ Nuevo juego</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {games.data.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onDeleteRequest={setToDelete}
                        />
                    ))}
                </div>
            )}

            <Pagination links={games.links} />

            <ConfirmModal
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar juego"
                description={`¿Seguro que quieres eliminar "${toDelete?.title}"? Las sesiones de juego asociadas también se eliminarán.`}
                confirmLabel="Sí, eliminar"
                processing={deleting}
                danger
            />
        </AppLayout>
    );
}
