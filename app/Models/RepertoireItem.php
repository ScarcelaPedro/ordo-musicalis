<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepertoireItem extends Model
{
    protected $fillable = [
        'repertoire_id',
        'ordem',
        'titulo_musica',
        'tom',
        'arquivo_pdf_path',
        'link_externo',
    ];

    public function repertoire(): BelongsTo
    {
        return $this->belongsTo(Repertoire::class);
    }
}
