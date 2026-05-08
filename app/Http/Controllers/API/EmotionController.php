<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EmotionEvent;
use App\Models\GameSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmotionController extends Controller
{
    public function store(Request $request, string $token): JsonResponse
    {
        $session = GameSession::where('session_token', $token)
            ->where('user_id', auth()->id())
            ->where('status', 'active')
            ->firstOrFail();

        $request->validate([
            'emotion'    => [
                'required',
                'string',
                'in:neutral,happy,sad,angry,surprised,fearful,disgusted',
            ],
            'confidence' => 'required|numeric|min:0|max:1',
            'session_timestamp_seconds' => 'required|integer|min:0',
        ]);

        EmotionEvent::create([
            'game_session_id'           => $session->id,
            'emotion'                   => $request->emotion,
            'confidence'                => $request->confidence,
            'session_timestamp_seconds' => $request->session_timestamp_seconds,
            'recorded_at'               => now(),
        ]);

        // 201 Created — respuesta mínima para no bloquear el juego
        return response()->json(['recorded' => true], 201);
    }

    /**
     * Resumen de emociones de una sesión.
     * Para el panel del gestor: ¿qué emociones generó este juego?
     *
     * GET /api/sessions/{token}/emotions/summary
     */
    public function summary(string $token): JsonResponse
    {
        $session = GameSession::where('session_token', $token)->firstOrFail();

        // Solo el dueño de la sesión o admin/gestor pueden ver el resumen
        $user = auth()->user();
        if ($session->user_id !== $user->id && ! $user->isAdminOrManager()) {
            abort(403);
        }

        $summary = $session->emotionEvents()
            ->selectRaw('emotion, COUNT(*) as count, AVG(confidence) as avg_confidence')
            ->groupBy('emotion')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            'session_token' => $token,
            'game_id'       => $session->game_id,
            'emotions'      => $summary,
        ]);
    }
}
