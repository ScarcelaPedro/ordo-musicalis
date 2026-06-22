<?php

namespace App\Http\Controllers;

use App\Models\Musician;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Team::class);

        return Inertia::render('Teams/Index', [
            'teams' => Team::withCount('musicians')->orderBy('nome')->get(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Team::class);

        return Inertia::render('Teams/Create', [
            'musicians' => Musician::orderBy('nome')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Team::class);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'ativo' => ['boolean'],
            'musicians' => ['nullable', 'array'],
            'musicians.*' => ['integer', 'exists:musicians,id'],
        ]);

        $team = Team::create($data);
        $team->musicians()->sync($data['musicians'] ?? []);

        return redirect()->route('equipes.index')->with('success', 'Equipe criada com sucesso.');
    }

    public function edit(Team $equipe): Response
    {
        $this->authorize('update', $equipe);

        $equipe->load('musicians');

        return Inertia::render('Teams/Edit', [
            'team' => $equipe,
            'musicians' => Musician::orderBy('nome')->get(),
        ]);
    }

    public function update(Request $request, Team $equipe): RedirectResponse
    {
        $this->authorize('update', $equipe);

        $data = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'ativo' => ['boolean'],
            'musicians' => ['nullable', 'array'],
            'musicians.*' => ['integer', 'exists:musicians,id'],
        ]);

        $equipe->update($data);
        $equipe->musicians()->sync($data['musicians'] ?? []);

        return redirect()->route('equipes.index')->with('success', 'Equipe atualizada com sucesso.');
    }

    public function destroy(Team $equipe): RedirectResponse
    {
        $this->authorize('delete', $equipe);

        $equipe->delete();

        return redirect()->route('equipes.index')->with('success', 'Equipe removida com sucesso.');
    }
}
