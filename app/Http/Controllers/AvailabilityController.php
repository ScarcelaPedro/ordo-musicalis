<?php

namespace App\Http\Controllers;

use App\Models\Musician;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AvailabilityController extends Controller
{
    public function form(Request $request): Response
    {
        $musician = $request->user()->musician;

        return Inertia::render('Availability/Form', [
            'musician' => $musician?->load('availabilities'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $musician = $request->user()->musician;

        abort_unless($musician, 403);

        $data = $request->validate([
            'disponibilidades' => ['array'],
            'disponibilidades.*.dia_semana' => ['required', 'integer', 'min:0', 'max:6'],
            'disponibilidades.*.periodo' => ['required', 'in:manha,tarde,noite'],
        ]);

        $musician->availabilities()->where('tipo', 'recorrente_semanal')->delete();

        foreach ($data['disponibilidades'] as $disponibilidade) {
            $musician->availabilities()->create([
                'tipo' => 'recorrente_semanal',
                'dia_semana' => $disponibilidade['dia_semana'],
                'periodo' => $disponibilidade['periodo'],
                'disponivel' => true,
            ]);
        }

        return redirect()->route('disponibilidade.form')->with('success', 'Disponibilidade salva com sucesso.');
    }

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdmin() || $request->user()->isCoordenador(), 403);

        return Inertia::render('Availability/Index', [
            'musicians' => Musician::with('availabilities')->orderBy('nome')->get(),
        ]);
    }
}
