<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    protected $fillable = ['nome', 'descricao', 'ativo'];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function musicians(): BelongsToMany
    {
        return $this->belongsToMany(Musician::class);
    }

    public function scales(): HasMany
    {
        return $this->hasMany(Scale::class);
    }
}
