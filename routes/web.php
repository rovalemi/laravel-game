<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Manager\GameController as ManagerGameController;
use App\Http\Controllers\Player\GameController as PlayerGameController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/home', function () {
    return Inertia('Welcome');
});

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route(match (auth()->user()->role->name) {
            'administrador' => 'admin.dashboard',
            'gestor' => 'manager.dashboard',
            default => 'player.games.index',
        })
        : Inertia::render('Welcome');
})->name('home');

/** Authentication */
Route::middleware('guest')->group(function() {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']); 
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

/** Panel Administrador */
Route::middleware(['auth', 'role:administrador'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
    Route::resource('users', AdminUserController::class);
});

// /** Panel Gestor (accesible también por admin) */
// Route::middleware(['auth', 'role:administrador,gestor'])->prefix('manager')->name('manager.')->group(function () {
//     Route::get('/dashboard', fn () => Inertia::render('Manager/Games/Index'))->name('dashboard');

//     Route::resource('games', ManagerGameController::class);
//     // Route::path('games/{game}/toggle-publish', [ManagerGameController::class, 'togglePublish'])->name('games.toggle-publish');
//     Route::get('games/{game}/preview', [ManagerGameController::class, 'preview'])->name('games.preview');
// });

// /** Área Jugador */
// Route::middleware(['auth', 'role:jugador'])->prefix('games')->name('player.')->group(function () {
//     Route::get("/", [PlayerGameController::class, 'index'])->name('games.index');
//     Route::get('/{game}/play', [PlayerGameController::class, 'play'])->name('games.play');
//         Route::get('/history', [PlayerGameController::class, 'history'])->name('games.history');
// });
