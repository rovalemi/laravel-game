<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de juegos.
     * Laravel gestiona los juegos como recursos pero NO los ejecuta.
     * Los juegos viven como apps cliente independientes (URL externa o asset local).
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            // published: controla visibilidad para jugadores (sin tocar código del juego)
            $table->boolean('published')->default(false);
            // URL o ruta interna donde vive el juego cliente (Three.js / JS)
            $table->string('url');
            $table->string('thumbnail_path')->nullable();
            // Usuario gestor/admin que creó el juego
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
