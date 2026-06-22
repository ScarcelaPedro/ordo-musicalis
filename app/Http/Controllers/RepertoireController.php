<?php

namespace App\Http\Controllers;

use App\Models\Repertoire;
use App\Models\Scale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RepertoireController extends Controller
{
    public function show(Scale $escala): Response
    {
        $this->authorize('view', $escala);

        $escala->load('repertoire.items');

        return Inertia::render('Repertoires/Show', [
            'scale' => $escala,
        ]);
    }

    public function edit(Scale $escala): Response
    {
        $this->authorize('create', Repertoire::class);

        $escala->load('repertoire.items');

        return Inertia::render('Repertoires/Edit', [
            'scale' => $escala,
        ]);
    }

    public function update(Request $request, Scale $escala): RedirectResponse
    {
        $this->authorize('create', Repertoire::class);

        $data = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'observacoes' => ['nullable', 'string'],
        ]);

        Repertoire::updateOrCreate(['scale_id' => $escala->id], $data);

        return redirect()->route('escalas.repertorio.edit', $escala->id)->with('success', 'Repertório salvo com sucesso.');
    }
}
