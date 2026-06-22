<?php

namespace App\Http\Controllers;

use App\Models\Musician;
use App\Models\Scale;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScaleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Scale::class);

        $scales = Scale::query()
            ->with('team')
            ->when(request('mes'), fn ($q, $mes) => $q->whereRaw("to_char(data, 'YYYY-MM') = ?", [$mes]))
            ->when(request('team_id'), fn ($q, $teamId) => $q->where('team_id', $teamId))
            ->orderBy('data')
            ->orderBy('horario')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Scales/Index', [
            'scales' => $scales,
            'teams' => Team::orderBy('nome')->get(),
            'filtros' => [
                'mes' => request('mes', ''),
                'team_id' => request('team_id', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Scale::class);

        return Inertia::render('Scales/Create', [
            'teams' => Team::orderBy('nome')->get(),
            'musicians' => Musician::with('instruments', 'availabilities')->orderBy('nome')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Scale::class);

        $data = $this->validateScale($request);

        $scale = Scale::create($data);
        $this->syncMusicians($scale, $data['musicians'] ?? []);

        return redirect()->route('escalas.index')->with('success', 'Escala criada com sucesso.');
    }

    public function show(Scale $escala): Response
    {
        $this->authorize('view', $escala);

        $escala->load(['team', 'repertoire.items', 'musicians.instruments']);

        return Inertia::render('Scales/Show', [
            'scale' => $escala,
        ]);
    }

    public function edit(Scale $escala): Response
    {
        $this->authorize('update', $escala);

        $escala->load('musicians');

        return Inertia::render('Scales/Edit', [
            'scale' => $escala,
            'teams' => Team::orderBy('nome')->get(),
            'musicians' => Musician::with('instruments', 'availabilities')->orderBy('nome')->get(),
        ]);
    }

    public function update(Request $request, Scale $escala): RedirectResponse
    {
        $this->authorize('update', $escala);

        $data = $this->validateScale($request);

        $escala->update($data);
        $this->syncMusicians($escala, $data['musicians'] ?? []);

        return redirect()->route('escalas.index')->with('success', 'Escala atualizada com sucesso.');
    }

    public function destroy(Scale $escala): RedirectResponse
    {
        $this->authorize('delete', $escala);

        $escala->delete();

        return redirect()->route('escalas.index')->with('success', 'Escala removida com sucesso.');
    }

    public function confirmar(Request $request, Scale $escala): RedirectResponse
    {
        $this->authorize('confirm', $escala);

        $musician = $request->user()->musician;

        abort_unless($musician, 403);

        $escala->musicians()->updateExistingPivot($musician->id, ['confirmado' => true]);

        return redirect()->back()->with('success', 'Presença confirmada.');
    }

    private function validateScale(Request $request): array
    {
        return $request->validate([
            'data' => ['required', 'date'],
            'horario' => ['required'],
            'celebracao' => ['required', 'string', 'max:255'],
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'observacoes' => ['nullable', 'string'],
            'status' => ['required', 'in:rascunho,confirmada'],
            'musicians' => ['nullable', 'array'],
            'musicians.*.musician_id' => ['required', 'integer', 'exists:musicians,id'],
            'musicians.*.instrument_id' => ['nullable', 'integer', 'exists:instruments,id'],
        ]);
    }

    private function syncMusicians(Scale $scale, array $musicians): void
    {
        $pivotData = collect($musicians)->mapWithKeys(fn ($m) => [
            $m['musician_id'] => ['instrument_id' => $m['instrument_id'] ?? null],
        ]);

        $scale->musicians()->sync($pivotData);
    }
}
