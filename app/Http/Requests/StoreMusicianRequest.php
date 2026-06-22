<?php

namespace App\Http\Requests;

use App\Models\Musician;
use Illuminate\Foundation\Http\FormRequest;

class StoreMusicianRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Musician::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'ativo' => ['boolean'],
            'observacoes' => ['nullable', 'string'],
            'instruments' => ['required', 'array', 'min:1'],
            'instruments.*' => ['integer', 'exists:instruments,id'],
            'teams' => ['nullable', 'array'],
            'teams.*' => ['integer', 'exists:teams,id'],
        ];
    }
}
