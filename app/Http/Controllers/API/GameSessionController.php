<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameSessionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'game_id' => 'required|integer|exists:games,id',
        ]);

        $game = Game::findOrFail($request->game_id);

        if (! $game->published) {
            return response()->json([
                'message' => 'Este juego no está disponible actualmente.',
            ], 403);
        }

        if (! Auth::user()->isPlayer()) {
            return response()->json([
                'message' => 'Solo los jugadores pueden iniciar sesiones de juego.',
            ], 403);
        }

        $session = GameSession::create([
            'user_id' => Auth::id(),
            'game_id' => $game->id,
        ]);

        return response()->json([
            'session_token' => $session->session_token,
            'started_at'    => $session->started_at,
            'game'          => [
                'id'    => $game->id,
                'title' => $game->title,
            ],
        ], 201);
    }

    public function finish(Request $request, string $token): JsonResponse
    {
        $session = GameSession::where('session_token', $token)
            ->where('user_id', Auth::id())
            ->where('status', 'active')
            ->firstOrFail();

        $request->validate([
            'score'       => 'nullable|integer',
            'result_data' => 'nullable|array',
        ]);

        $session->finish(
            score: $request->score,
            resultData: $request->result_data ?? []
        );

        return response()->json([
            'message'          => 'Sesión finalizada.',
            'duration_seconds' => $session->duration_seconds,
            'score'            => $session->score,
        ]);
    }

    public function show(string $token): JsonResponse
    {
        $session = GameSession::where('session_token', $token)
            ->where('user_id', Auth::id())
            ->with('game:id,title')
            ->firstOrFail();

        return response()->json($session);
    }
}
