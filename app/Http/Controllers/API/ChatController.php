<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\Game;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(Game $game): JsonResponse
    {
        abort_unless($game->published || auth()->user()->isAdminOrManager(), 404);

        $messages = ChatMessage::where('game_id', $game->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->take(50)
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, Game $game): JsonResponse
    {
        abort_unless($game->published || auth()->user()->isAdminOrManager(), 404);

        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $chatMessage = ChatMessage::create([
            'user_id' => auth()->id(),
            'game_id' => $game->id,
            'message' => $request->message,
        ]);

        $chatMessage->load('user:id,name');

        broadcast(new MessageSent($chatMessage))->toOthers();

        return response()->json($chatMessage, 201);
    }
}
