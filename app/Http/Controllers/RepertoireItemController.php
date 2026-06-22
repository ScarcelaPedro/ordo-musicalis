<?php

namespace App\Http\Controllers;

use App\Models\Repertoire;
use App\Models\RepertoireItem;
use App\Models\Scale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RepertoireItemController extends Controller
{
    public function store(Request $request, Scale $escala): RedirectResponse
    {
        $this->authorize('create', Repertoire::class);

        $data = $this->validateItem($request);

        $repertoire = Repertoire::firstOrCreate(
            ['scale_id' => $escala->id],
            ['titulo' => "Repertório — {$escala->celebracao}"]
        );

        if ($request->hasFile('arquivo_pdf')) {
            $data['arquivo_pdf_path'] = $request->file('arquivo_pdf')->store('partituras', 'public');
        }

        $data['ordem'] = $repertoire->items()->max('ordem') + 1;

        $repertoire->items()->create($data);

        return redirect()->route('escalas.repertorio.edit', $escala->id)->with('success', 'Música adicionada ao repertório.');
    }

    public function update(Request $request, RepertoireItem $item): RedirectResponse
    {
        $this->authorize('create', Repertoire::class);

        $data = $this->validateItem($request);

        if ($request->hasFile('arquivo_pdf')) {
            if ($item->arquivo_pdf_path) {
                Storage::disk('public')->delete($item->arquivo_pdf_path);
            }

            $data['arquivo_pdf_path'] = $request->file('arquivo_pdf')->store('partituras', 'public');
        }

        $item->update($data);

        return redirect()->route('escalas.repertorio.edit', $item->repertoire->scale_id)->with('success', 'Música atualizada.');
    }

    public function destroy(RepertoireItem $item): RedirectResponse
    {
        $this->authorize('create', Repertoire::class);

        if ($item->arquivo_pdf_path) {
            Storage::disk('public')->delete($item->arquivo_pdf_path);
        }

        $scaleId = $item->repertoire->scale_id;
        $item->delete();

        return redirect()->route('escalas.repertorio.edit', $scaleId)->with('success', 'Música removida do repertório.');
    }

    public function download(RepertoireItem $item): StreamedResponse
    {
        abort_unless($item->arquivo_pdf_path, 404);

        return Storage::disk('public')->download($item->arquivo_pdf_path, "{$item->titulo_musica}.pdf");
    }

    private function validateItem(Request $request): array
    {
        return $request->validate([
            'titulo_musica' => ['required', 'string', 'max:255'],
            'tom' => ['nullable', 'string', 'max:50'],
            'link_externo' => ['nullable', 'url', 'max:255'],
            'ordem' => ['nullable', 'integer'],
            'arquivo_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ]);
    }
}
