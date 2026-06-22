<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import ScaleForm from './Partials/ScaleForm.vue';

const props = defineProps({
    scale: {
        type: Object,
        required: true,
    },
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
    data: props.scale.data.substring(0, 10),
    horario: props.scale.horario,
    celebracao: props.scale.celebracao,
    team_id: props.scale.team_id,
    status: props.scale.status,
    observacoes: props.scale.observacoes,
    musicians: props.scale.musicians.map((m) => ({
        musician_id: m.id,
        instrument_id: m.pivot.instrument_id,
    })),
});

function submit() {
    form.put(route('escalas.update', props.scale.id));
}
</script>

<template>
    <Head title="Editar Escala" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Editar Escala</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <ScaleForm :form="form" :teams="teams" :musicians="musicians" submit-label="Salvar alterações" @submit="submit" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
