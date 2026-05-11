<?php

use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\EmotionController;
use App\Http\Controllers\API\FacialController;
use App\Http\Controllers\API\GameSessionController;
use Illuminate\Support\Facades\Route;
use App\Services\RabbitMQService;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sessions', [GameSessionController::class, 'store']);
    Route::get('/sessions/{token}', [GameSessionController::class, 'show']);
    Route::patch('/sessions/{token}/finish', [GameSessionController::class, 'finish']);

    Route::post('/sessions/{token}/emotions', [EmotionController::class, 'store']);
    Route::get('/sessions/{token}/emotions/summary', [EmotionController::class, 'summary']);

    Route::post('/face/enroll', [FacialController::class, 'enroll']);
    Route::post('/face/verify', [FacialController::class, 'verify']);

    Route::get('/games/{game:slug}/messages', [ChatController::class, 'index']);
    Route::post('/games/{game:slug}/messages', [ChatController::class, 'store']);
});

Route::post('/rabbitmq/test', function () {
    RabbitMQService::publish('game_events', [
        'event' => 'test_event',
        'timestamp' => now()->toDateTimeString(),
    ]);

    return ['status' => 'ok'];
});
