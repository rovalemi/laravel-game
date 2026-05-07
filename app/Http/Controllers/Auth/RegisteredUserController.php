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
            'face_image' => ['nullable'],
        ]);

        $fileName = null;

        // Si el usuario capturó rostro
        if ($request->face_image) {
            $image = str_replace('data:image/jpeg;base64,', '', $request->face_image);
            $image = base64_decode($image);

            $fileName = 'faces/' . uniqid() . '.jpg';
            Storage::disk('public')->put($fileName, $image);
        }

        // Rol jugador
        $playerRole = Role::where('name', Role::PLAYER)->firstOrFail();

        // Crear usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $playerRole->id,
            'face_image_path' => $fileName,
            'face_enrolled' => $fileName ? true : false,
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('player.games.index');
    }
}
