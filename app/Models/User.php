<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'face_image_path',
        'face_enrolled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'face_image_path',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'face_enrolled' => 'boolean',
    ];

    /** Relaciones */

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'created_by');
    }

    /** Helpers */

    public function isAdmin(): bool
    {
        return $this->role->name === Role::ADMIN;
    }

    public function isManager(): bool
    {
        return $this->role->name === Role::MANAGER;
    }

    public function isPlayer(): bool
    {
        return $this->role->name === Role::PLAYER;
    }

    public function isAdminOrManager(): bool
    {
        return $this->isAdmin() || $this->isManager();
    }

    public function getRoleNameAttribute(): string
    {
        return $this->role->name ?? '';
    }
}
