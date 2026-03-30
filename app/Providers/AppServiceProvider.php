<?php

namespace App\Providers;

use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Registrar alias del midlleware de roles
        // Uso: ->middleware('role:administrador') o ->middleware('role:administrador,gestor')
        Route::aliasMiddleware('role', CheckRole::class);
    }
}
