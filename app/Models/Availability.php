<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Availability extends Model
{
    protected $fillable = [
        'musician_id',
        'tipo',
        'dia_semana',
        'data',
        'periodo',
        'disponivel',
        'observacao',
    ];

    protected $casts = [
        'data' => 'date',
        'disponivel' => 'boolean',
    ];

    public function musician(): BelongsTo
    {
        return $this->belongsTo(Musician::class);
    }
}
