<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    // Nombres de rol usados en todo el sistema (constantes para evitar magic strings)
    const ADMIN = 'administrador';
    const MANAGER = 'gestor';
    const PLAYER = 'jugador';

    protected $fillable = ['name', 'display_name', 'description'];

    /**
     * Todos los usuarios que tienen este rol.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
