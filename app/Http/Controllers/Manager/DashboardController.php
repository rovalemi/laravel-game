<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameSession;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Manager/Dashboard', [
            'stats' => [
                'published' => Game::where('published', true)->count(),
                'drafts' => Game::where('published', false)->count(),
                'sessions' => GameSession::count(),
                'players' => GameSession::distinct('user_id')->count('user_id'),
            ],

            'recentGames' => Game::select('id', 'title', 'url', 'published')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ]);
    }
}
