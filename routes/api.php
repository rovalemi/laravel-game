<?php

use App\Http\Controllers\API\GameSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sessions', [GameSessionController::class, 'store']);
    Route::get('/sessions/{token}', [GameSessionController::class, 'show']);
    Route::patch('/sessions/{token}/finish', [GameSessionController::class, 'finish']);
});
