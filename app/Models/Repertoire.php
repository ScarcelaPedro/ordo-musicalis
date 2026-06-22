<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Repertoire extends Model
{
    protected $fillable = ['scale_id', 'titulo', 'observacoes'];

    public function scale(): BelongsTo
    {
        return $this->belongsTo(Scale::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(RepertoireItem::class)->orderBy('ordem');
    }
}
