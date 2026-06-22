<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import TeamForm from './Partials/TeamForm.vue';

defineProps({
    musicians: {
        type: Array,
        required: true,
    },
});

const form = useForm({
    nome: '',
    descricao: '',
    ativo: true,
    musicians: [],
});

function submit() {
    form.post(route('equipes.store'));
}
</script>

<template>
    <Head title="Criar Equipe" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Criar Equipe</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <TeamForm :form="form" :musicians="musicians" submit-label="Criar" @submit="submit" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
