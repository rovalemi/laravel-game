<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GameSession extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
        'session_token',
        'started_at',
        'ended_at',
        'duration_seconds',
        'score',
        'result_data',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'result_data' => 'array',
    ];

    // Boot: genera el session_token automáticamente
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (GameSession $session) {
            $session->session_token = (string) Str::uuid();
            $session->started_at = now();
        });
    }

    /** Relaciones */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** Helpers */

    public function finish(int $score = null, array $resultData = []): void
    {
        $this->ended_at = now();
        $this->duration_seconds = now()->diffInSeconds($this->started_at);
        $this->status = 'completed';
        $this->score = $score;
        $this->result_data = $resultData;
        $this->save();
    }
}
