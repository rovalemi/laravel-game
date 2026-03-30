<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de sesiones de juego.
     * Cada vez que un jugador inicia una partida, se crea un registro aquí.
     * El juego cliente usa el session_token para identificar la sesión en la API.
     */
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            // Token único para identificar la sesión desde el cliente del juego
            $table->string('session_token')->unique();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            // Duración calculada en segundos al cerrar la sesión
            $table->unsignedInteger('duration_seconds')->nullable();
            // score/resultado numérico del juego
            $table->integer('score')->nullable();
            // JSON flexible para datos adicionales específicos del juego
            $table->json('result_data')->nullable();
            // Estados posibles: active | completed | abandoned
            $table->enum('status', ['active', 'completed', 'abandoned'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
