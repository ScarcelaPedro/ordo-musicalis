<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Instrument extends Model
{
    protected $fillable = ['nome'];

    public function musicians(): BelongsToMany
    {
        return $this->belongsToMany(Musician::class);
    }
}
