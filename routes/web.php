<?php

use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\MusicianController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RepertoireController;
use App\Http\Controllers\RepertoireItemController;
use App\Http\Controllers\ScaleController;
use App\Http\Controllers\TeamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('musicos', MusicianController::class)
        ->parameters(['musicos' => 'musico']);

    Route::resource('equipes', TeamController::class)
        ->parameters(['equipes' => 'equipe'])
        ->except('show');

    Route::resource('escalas', ScaleController::class)
        ->parameters(['escalas' => 'escala']);

    Route::patch('escalas/{escala}/confirmar', [ScaleController::class, 'confirmar'])
        ->name('escalas.confirmar');

    Route::get('escalas/{escala}/repertorio', [RepertoireController::class, 'show'])
        ->name('escalas.repertorio.show');
    Route::get('escalas/{escala}/repertorio/editar', [RepertoireController::class, 'edit'])
        ->name('escalas.repertorio.edit');
    Route::put('escalas/{escala}/repertorio', [RepertoireController::class, 'update'])
        ->name('escalas.repertorio.update');
    Route::post('escalas/{escala}/repertorio/itens', [RepertoireItemController::class, 'store'])
        ->name('repertorio-itens.store');

    Route::put('repertorio-itens/{item}', [RepertoireItemController::class, 'update'])
        ->name('repertorio-itens.update');
    Route::delete('repertorio-itens/{item}', [RepertoireItemController::class, 'destroy'])
        ->name('repertorio-itens.destroy');
    Route::get('repertorio-itens/{item}/download', [RepertoireItemController::class, 'download'])
        ->name('repertorio-itens.download');

    Route::get('disponibilidade', [AvailabilityController::class, 'form'])->name('disponibilidade.form');
    Route::post('disponibilidade', [AvailabilityController::class, 'store'])->name('disponibilidade.store');
    Route::get('disponibilidade/painel', [AvailabilityController::class, 'index'])->name('disponibilidade.index');
});

require __DIR__.'/auth.php';
