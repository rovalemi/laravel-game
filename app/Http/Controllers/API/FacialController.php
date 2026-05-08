<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class FacialController extends Controller
{
    public function enroll(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $user = auth()->user();

        if ($user->face_image_path) {
            Storage::disk('local')->delete($user->face_image_path);
        }

        $path = $request->file('image')->storeAs(
            'faces',
            "user_{$user->id}.jpg",
            'local'
        );

        $user->update([
            'face_image_path' => $path,
            'face_enrolled'   => true,
        ]);

        return response()->json([
            'enrolled' => true,
            'message'  => 'Imagen facial registrada correctamente.',
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:4096',
        ]);

        $user = auth()->user();

        if (! $user->face_enrolled || ! $user->face_image_path) {
            return response()->json([
                'verified' => false,
                'message'  => 'No tienes ninguna imagen facial registrada. Ve a Configuración de seguridad para enrolarte.',
            ], 422);
        }

        $enrolledImagePath = Storage::disk('local')->path($user->face_image_path);
        $currentImage      = $request->file('image');

        try {
            $response = Http::timeout(config('services.facial.timeout', 10))
                ->attach('enrolled_image', file_get_contents($enrolledImagePath), 'enrolled.jpg')
                ->attach('current_image', file_get_contents($currentImage->getRealPath()), 'current.jpg')
                ->post(config('services.facial.url') . '/compare');

            if (! $response->successful()) {
                return response()->json([
                    'verified' => false,
                    'message'  => 'El servicio de reconocimiento facial no está disponible.',
                ], 503);
            }

            $result = $response->json();

            $verified = $result['match'] === true && ($result['distance'] ?? 1) < 0.5;

            return response()->json([
                'verified'   => $verified,
                'confidence' => $result['confidence'] ?? null,
                'message'    => $verified
                    ? 'Identidad verificada correctamente.'
                    : 'No se pudo verificar la identidad. Inténtalo de nuevo.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'verified' => false,
                'message'  => 'Error al conectar con el servicio de reconocimiento facial.',
            ], 503);
        }
    }
}
