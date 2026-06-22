<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import ScaleForm from './Partials/ScaleForm.vue';

defineProps({
    teams: {
        type: Array,
        required: true,
    },
    musicians: {
        type: Array,
        required: true,
    },
});

const form = useForm({
    data_celebracao: '',
    horario: '',
    celebracao: '',
    team_id: null,
    status: 'rascunho',
    observacoes: '',
    musicians: [],
});

function submit() {
    form
        .transform(({ data_celebracao, ...rest }) => ({ ...rest, data: data_celebracao }))
        .post(route('escalas.store'));
}
</script>

<template>
    <Head title="Nova Escala" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Nova Escala</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ScaleForm :form="form" :teams="teams" :musicians="musicians" submit-label="Criar escala" @submit="submit" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
