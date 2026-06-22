<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Musician extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nome',
        'telefone',
        'email',
        'ativo',
        'observacoes',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instruments(): BelongsToMany
    {
        return $this->belongsToMany(Instrument::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class);
    }

    public function scales(): BelongsToMany
    {
        return $this->belongsToMany(Scale::class, 'scale_musician')
            ->withPivot('instrument_id', 'confirmado')
            ->withTimestamps();
    }
}
