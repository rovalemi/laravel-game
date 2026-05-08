<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmotionEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'game_session_id',
        'emotion',
        'confidence',
        'session_timestamp_seconds',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'confidence'  => 'float',
    ];

    const VALID_EMOTIONS = [
        'neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }
}
