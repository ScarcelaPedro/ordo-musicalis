<?php

namespace Database\Seeders;

use App\Models\Instrument;
use Illuminate\Database\Seeder;

class InstrumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $instrumentos = [
            'Violão',
            'Teclado/Piano',
            'Voz',
            'Bateria',
            'Baixo',
            'Flauta',
            'Violino',
            'Cajón',
        ];

        foreach ($instrumentos as $nome) {
            Instrument::firstOrCreate(['nome' => $nome]);
        }
    }
}
