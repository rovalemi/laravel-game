<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\FacialService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request, FacialService $facial): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'face_image' => ['required'], // ← NUEVO
        ]);

        // 1. Guardar imagen en storage
        $image = $request->face_image;
        $image = str_replace('data:image/jpeg;base64,', '', $image);
        $image = base64_decode($image);

        $fileName = 'faces/' . uniqid() . '.jpg';
        Storage::disk('public')->put($fileName, $image);

        // 2. Obtener rol jugador
        $playerRole = Role::where('name', Role::PLAYER)->firstOrFail();

        // 3. Crear usuario con ruta de imagen
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $playerRole->id,
            'face_image_path' => $fileName,
            'face_enrolled' => true,
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('player.games.index');
    }
}
