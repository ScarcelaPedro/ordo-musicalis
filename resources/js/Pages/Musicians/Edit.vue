<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import MusicianForm from './Partials/MusicianForm.vue';

const props = defineProps({
    musician: {
        type: Object,
        required: true,
    },
    instruments: {
        type: Array,
        required: true,
    },
    teams: {
        type: Array,
        required: true,
    },
});

const form = useForm({
    nome: props.musician.nome,
    telefone: props.musician.telefone,
    email: props.musician.email,
    observacoes: props.musician.observacoes,
    ativo: props.musician.ativo,
    instruments: props.musician.instruments.map((i) => i.id),
    teams: props.musician.teams.map((t) => t.id),
});

function submit() {
    form.put(route('musicos.update', props.musician.id));
}
</script>

<template>
    <Head title="Editar Músico" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Editar Músico</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <MusicianForm
                        :form="form"
                        :instruments="instruments"
                        :teams="teams"
                        submit-label="Salvar alterações"
                        @submit="submit"
                    />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
