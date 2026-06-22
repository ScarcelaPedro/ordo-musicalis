<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scales', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->time('horario');
            $table->string('celebracao');
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->text('observacoes')->nullable();
            $table->string('status')->default('rascunho');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scales');
    }
};
