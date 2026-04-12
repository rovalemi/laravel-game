<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\FacialService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request, FacialService $facial)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'face_image' => ['required'], // ← NUEVO
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'Usuario no encontrado']);
        }

        if (!$user->face_enrolled || !$user->face_image_path) {
            return back()->withErrors(['face_image' => 'El usuario no tiene rostro registrado']);
        }

        // 1. Enviar imagen capturada + ruta de referencia al microservicio
        $result = $facial->verify(
            $request->face_image,
            storage_path('app/public/' . $user->face_image_path)
        );

        if (!isset($result['match']) || !$result['match']) {
            return back()->withErrors(['face_image' => 'El rostro no coincide']);
        }

        // 2. Login exitoso
        Auth::login($user);

        return redirect()->intended(route('player.games.index'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
