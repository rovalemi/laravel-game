<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de control de roles.
 * Uso en rutas:
 *  ->middleware('role:administrador')
 *  ->middleware('role:administrador,gestor')
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! in_array($user->role->name, $roles)) {
            abort(403, 'No tienes permisos para acceder a esta sección.');
        }
        
        return $next($request);
    }
}
