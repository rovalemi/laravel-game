<?php

use App\Models\Game;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('game.{gameId}', function ($user, int $gameId) {
    $game = Game::find($gameId);
 
    if (! $game) {
        return false;
    }
 
    if ($user->isAdminOrManager()) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => $user->role->name];
    }
 
    if ($user->isPlayer() && $game->published) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'jugador'];
    }
 
    return false; 
});
