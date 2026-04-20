<?php

use App\Models\Game;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('game.{gameId}', function ($user, int $gameId) {
    $game = Game::find($gameId);
 
    if (! $game) {
        return false;
    }
 
    // Admin y gestor: acceso siempre (para monitorizar el chat)
    if ($user->isAdminOrManager()) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => $user->role->name];
    }
 
    // Jugador: solo si el juego está publicado
    if ($user->isPlayer() && $game->published) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'jugador'];
    }
 
    return false; // Acceso denegado → Reverb rechaza la suscripción
});
