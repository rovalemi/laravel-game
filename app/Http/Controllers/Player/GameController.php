<?php

namespace App\Http\Controllers\Player;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GameController extends Controller
{
    public function index(): Response
    {
        $games = Game::published()
            ->select('id', 'slug', 'title', 'description', 'thumbnail_path', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Player/Games/Index', ['games' => $games]);
    }

    public function play(Game $game): Response
    {
        abort_unless($game->published, 404);

        if ($game->component) {
            return Inertia::render('Games/' . $game->component, [
                'game'     => $game,
                'apiToken' => Auth::user()->createToken('game-session')->plainTextToken,
            ]);
        }

        return Inertia::render('Player/Games/Play', [
            'game'     => $game->only('id', 'title', 'description', 'url', 'thumbnail_path'),
            'apiToken' => Auth::user()->createToken('game-session')->plainTextToken,
        ]);
    }

    public function history(): Response
    {
        $sessions = Auth::user()
            ->gameSessions()
            ->with('game:id,title')
            ->orderBy('started_at', 'desc')
            ->paginate(20);

        return Inertia::render('Player/History', ['sessions' => $sessions]);
    }
}
