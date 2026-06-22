<?php

namespace App\Models;

use App\Enums\ScaleStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Scale extends Model
{
    protected $fillable = [
        'data',
        'horario',
        'celebracao',
        'team_id',
        'observacoes',
        'status',
    ];

    protected $casts = [
        'data' => 'date',
        'status' => ScaleStatus::class,
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function musicians(): BelongsToMany
    {
        return $this->belongsToMany(Musician::class, 'scale_musician')
            ->withPivot('instrument_id', 'confirmado')
            ->withTimestamps();
    }

    public function repertoire(): HasOne
    {
        return $this->hasOne(Repertoire::class);
    }
}
