import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

import SectionHeader from "@/Components/ui/SectionHeader";
import { EmptyState, Pagination } from "@/Components/shared";
import GameManagerCard from "@/Components/modules/games/GameManagerCard";

export default function GamesIndex({ games }) {
    const togglePublish = (game) => {
        router.patch(route("manager.games.toggle-publish", game.id));
    };

    const deleteGame = (game) => {
        if (confirm(`¿Eliminar "${game.title}"?`)) {
            router.delete(route("manager.games.destroy", game.id));
        }
    };

    return (
        <AppLayout title="Gestión de Juegos">
            <Head title="Juegos" />

            <SectionHeader
                title="Catálogo de Juegos"
                subtitle={`${games.total} juego${games.total !== 1 ? "s" : ""} en el sistema`}
            />

            <div className="flex justify-end mb-4">
                <Link
                    href={route("manager.games.create")}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                    + Nuevo juego
                </Link>
            </div>

            {games.data.length === 0 ? (
                <EmptyState
                    icon="◆"
                    message="Aún no hay juegos. Crea el primero."
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {games.data.map((game) => (
                        <GameManagerCard
                            key={game.id}
                            game={game}
                            onToggle={togglePublish}
                            onDelete={deleteGame}
                        />
                    ))}
                </div>
            )}

            {games.last_page > 1 && <Pagination links={games.links} />}
        </AppLayout>
    );
}
