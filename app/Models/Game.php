<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Game extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'published',
        'url',
        'thumbnail_path',
        'created_by',
    ];

    protected $casts = [
        'published' => 'boolean',
    ];

    /** Relaciones */

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    /** Scopes */

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}
