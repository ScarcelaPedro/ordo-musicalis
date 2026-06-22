<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMusicianRequest;
use App\Http\Requests\UpdateMusicianRequest;
use App\Models\Instrument;
use App\Models\Musician;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MusicianController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Musician::class);

        $musicians = Musician::query()
            ->with('instruments')
            ->when(request('busca'), function ($query, $busca) {
                $query->where(function ($q) use ($busca) {
                    $q->where('nome', 'ilike', "%{$busca}%")
                        ->orWhereHas('instruments', fn ($i) => $i->where('nome', 'ilike', "%{$busca}%"));
                });
            })
            ->orderBy('nome')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Musicians/Index', [
            'musicians' => $musicians,
            'filtros' => ['busca' => request('busca', '')],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Musician::class);

        return Inertia::render('Musicians/Create', [
            'instruments' => Instrument::orderBy('nome')->get(),
            'teams' => Team::orderBy('nome')->get(),
        ]);
    }

    public function store(StoreMusicianRequest $request): RedirectResponse
    {
        $musician = Musician::create($request->safe()->except(['instruments', 'teams']));
        $musician->instruments()->sync($request->input('instruments'));
        $musician->teams()->sync($request->input('teams', []));

        return redirect()->route('musicos.index')->with('success', 'Músico cadastrado com sucesso.');
    }

    public function show(Musician $musico): Response
    {
        $this->authorize('view', $musico);

        $musico->load(['instruments', 'teams', 'scales' => fn ($q) => $q->orderByDesc('data'), 'availabilities']);

        return Inertia::render('Musicians/Show', [
            'musician' => $musico,
        ]);
    }

    public function edit(Musician $musico): Response
    {
        $this->authorize('update', $musico);

        $musico->load('instruments', 'teams');

        return Inertia::render('Musicians/Edit', [
            'musician' => $musico,
            'instruments' => Instrument::orderBy('nome')->get(),
            'teams' => Team::orderBy('nome')->get(),
        ]);
    }

    public function update(UpdateMusicianRequest $request, Musician $musico): RedirectResponse
    {
        $musico->update($request->safe()->except(['instruments', 'teams']));
        $musico->instruments()->sync($request->input('instruments'));
        $musico->teams()->sync($request->input('teams', []));

        return redirect()->route('musicos.index')->with('success', 'Músico atualizado com sucesso.');
    }

    public function destroy(Musician $musico): RedirectResponse
    {
        $this->authorize('delete', $musico);

        $musico->delete();

        return redirect()->route('musicos.index')->with('success', 'Músico removido com sucesso.');
    }
}
