<?php

use App\Http\API\Controllers\ChatController;
use App\Http\Controllers\API\EmotionController;
use App\Http\Controllers\API\FacialController;
use App\Http\Controllers\API\GameSessionController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sessions', [GameSessionController::class, 'store']);
    Route::get('/sessions/{token}', [GameSessionController::class, 'show']);
    Route::patch('/sessions/{token}/finish', [GameSessionController::class, 'finish']);

    Route::post('/sessions/{token}/emotions', [EmotionController::class, 'store']);
    Route::get('/sessions/{token}/emotions/summary', [EmotionController::class, 'summary']);

    Route::post('/face/enroll', [FacialController::class, 'enroll']);
    Route::post('/face/verify', [FacialController::class, 'verify']);

    Route::get('/games/{game}/messages', [ChatController::class, 'index']);
    Route::post('/games/{game}/messages', [ChatController::class, 'store']);
});
