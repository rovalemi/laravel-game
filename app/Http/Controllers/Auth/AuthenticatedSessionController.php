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

    public function store(Request $request, FacialService $facial): RedirectResponse
    {
        // 1. Validar credenciales básicas
        $credentials = $request->validate([
            'email'      => ['required', 'email'],
            'password'   => ['required'],
            'face_image' => ['nullable'], // opcional
        ]);

        // 2. Autenticar SIEMPRE con email + password
        if (!Auth::attempt(
            ['email' => $credentials['email'], 'password' => $credentials['password']],
            $request->boolean('remember')
        )) {
            return back()
                ->withErrors(['email' => 'Credenciales incorrectas'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // 3. Si el usuario tiene cara enrolada y el frontend ha enviado imagen, intentar verificación facial
        if ($user->face_enrolled && $user->face_image_path && $request->filled('face_image')) {
            $facialResult = $this->attemptFacialVerification(
                $user,
                $request->input('face_image'),
                $facial
            );

            // service_unavailable → fallback silencioso
            if ($facialResult === 'service_unavailable') {
                logger()->warning("Facial service unavailable for user {$user->id}, fallback to password");
                session()->flash('warning', 'Verificación facial no disponible. Acceso con contraseña.');
            }
            // false → verificación facial fallida → cerrar sesión
            elseif ($facialResult === false) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors(['face_image' => 'Verificación facial fallida.']);
            }
            // true → todo OK, seguimos
        }

        // 4. Redirección según rol
        return match ($user->role->name ?? null) {
            'administrador' => redirect()->route('admin.dashboard'),
            'gestor'        => redirect()->route('manager.dashboard'),
            default         => redirect()->route('player.games.index'),
        };
    }

    private function attemptFacialVerification(User $user, string $probeImage, FacialService $facial): bool|string
    {
        try {
            // Cargar imagen de referencia del almacenamiento
            $path = storage_path('app/public/' . $user->face_image_path);

            if (!file_exists($path)) {
                logger()->warning("Face image not found for user {$user->id}, skipping facial verification");
                return 'service_unavailable';
            }

            $referenceImage = 'data:image/jpeg;base64,' . base64_encode(
                file_get_contents($path)
            );

            $result = $facial->verify($probeImage, $referenceImage);

            // Si el microservicio responde raro, lo tratamos como no disponible
            if (!is_array($result) || !array_key_exists('match', $result)) {
                return 'service_unavailable';
            }

            return (bool) $result['match'];
        } catch (\Throwable $e) {
            logger()->error("Facial verification error for user {$user->id}: {$e->getMessage()}");
            return 'service_unavailable';
        }
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
