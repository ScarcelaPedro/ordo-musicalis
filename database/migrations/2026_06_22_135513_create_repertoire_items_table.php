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
        Schema::create('repertoire_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repertoire_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('ordem')->default(0);
            $table->string('titulo_musica');
            $table->string('tom')->nullable();
            $table->string('arquivo_pdf_path')->nullable();
            $table->string('link_externo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repertoire_items');
    }
};
