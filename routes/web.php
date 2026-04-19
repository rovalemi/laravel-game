<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Manager\GameController as ManagerGameController;
use App\Http\Controllers\Player\GameController as PlayerGameController;
use App\Services\FacialService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/home', function () {
    return Inertia('Welcome');
});

Route::get('/', function () {
    if (!Auth::check()) {
        return Inertia::render('Welcome');
    }

    $role = Auth::user()->role->name;

    $route = match ($role) {
        'administrador' => 'admin.dashboard',
        'gestor' => 'manager.dashboard',
        default => 'player.games.index',
    };

    return redirect()->route($route);
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
    Route::resource('users', AdminUserController::class)->except(['create', 'edit']);;
});

/** Panel Gestor (accesible también por admin) */
Route::middleware(['auth', 'role:administrador,gestor'])->prefix('manager')->name('manager.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Manager/Dashboard'))->name('dashboard');

    Route::resource('games', ManagerGameController::class);
    Route::patch('games/{game}/toggle-publish', [ManagerGameController::class, 'togglePublish'])->name('games.toggle-publish');
    Route::get('games/{game}/preview', [ManagerGameController::class, 'preview'])->name('games.preview');
});

/** Panel Jugador */
Route::middleware(['auth', 'role:jugador'])->prefix('player')->name('player.')->group(function () {
    Route::get('/games', [PlayerGameController::class, 'index'])->name('games.index');
    Route::get('/games/{game}/play', [PlayerGameController::class, 'play'])->name('games.play');
    Route::get('/history', [PlayerGameController::class, 'history'])->name('games.history');
});

Route::get('/test-facial', [\App\Http\Controllers\FacialTestController::class, 'status']);

Route::get('/facial/status', function (FacialService $facial) {
    return response()->json([
        'available' => $facial->status()
    ]);
});
