<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import TeamForm from './Partials/TeamForm.vue';

const props = defineProps({
    team: {
        type: Object,
        required: true,
    },
    musicians: {
        type: Array,
        required: true,
    },
});

const form = useForm({
    nome: props.team.nome,
    descricao: props.team.descricao,
    ativo: props.team.ativo,
    musicians: props.team.musicians.map((m) => m.id),
});

function submit() {
    form.put(route('equipes.update', props.team.id));
}
</script>

<template>
    <Head title="Editar Equipe" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Editar Equipe</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <TeamForm :form="form" :musicians="musicians" submit-label="Salvar alterações" @submit="submit" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
