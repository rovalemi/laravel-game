<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameSession;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => User::count(),
                'published_games' => Game::where('published', true)->count(),
                'sessions_today' => GameSession::whereDate('created_at', Carbon::today())->count(),
                'active_players' => GameSession::where('created_at', '>=', now()->subMinutes(10))->distinct('user_id')->count('user_id'),
            ]
        ]);
    }
}
