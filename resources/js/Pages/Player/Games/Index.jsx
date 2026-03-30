import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

import SectionHeader from '@/Components/ui/SectionHeader';
import EmptyState from '@/Components/shared/EmptyState';
import GameCard from '@/Components/modules/games/GameCard';

export default function PlayerGamesIndex({ games }) {
    return (
        <AppLayout title="Juegos disponibles">
            <Head title="Jugar" />

            <SectionHeader
                title="Elige tu juego"
                subtitle={`${games.length} juego${games.length !== 1 ? 's' : ''} disponible${games.length !== 1 ? 's' : ''}`}
            />

            {games.length === 0 ? (
                <EmptyState
                    icon="◆"
                    message="No hay juegos disponibles en este momento."
                    hint="Vuelve pronto, el gestor está preparando nuevos juegos."
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {games.map(game => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
