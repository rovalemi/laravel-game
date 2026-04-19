<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FacialService
{
    public function status(): bool
    {
        try {
            $response = Http::timeout(3)
                ->get(config('services.microservicio.url') . '/status');

            return $response->successful();
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function detect(string $imageBase64)
    {
        return Http::post(config('services.microservicio.url').'/detect', [
            'image_base64' => $imageBase64,
        ])->json();
    }

    public function enroll(string $imageBase64)
    {
        return Http::post(config('services.microservicio.url').'/enroll', [
            'image_base64' => $imageBase64,
        ])->json();
    }

    public function verify(string $imageBase64, string $referenceBase64)
    {
        return Http::timeout(60)->post(
            config('services.microservicio.url').'/verify',
            [
                'image_base64' => $imageBase64,
                'reference_base64' => $referenceBase64,
            ]
        )->json();
    }
}
