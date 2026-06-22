<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Badge from '@/Components/Badge.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, Link, router } from '@inertiajs/vue3';

defineProps({
    teams: {
        type: Array,
        required: true,
    },
});

function remover(equipe) {
    if (confirm(`Remover a equipe "${equipe.nome}"?`)) {
        router.delete(route('equipes.destroy', equipe.id));
    }
}
</script>

<template>
    <Head title="Equipes" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Equipes</h2>
        </template>

        <div class="py-12">
            <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <div class="flex justify-end mb-6">
                        <Link :href="route('equipes.create')">
                            <PrimaryButton>Criar Equipe</PrimaryButton>
                        </Link>
                    </div>

                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-500 uppercase border-b">
                            <tr>
                                <th class="py-2 pr-4">Nome</th>
                                <th class="py-2 pr-4">Músicos</th>
                                <th class="py-2 pr-4">Status</th>
                                <th class="py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="equipe in teams" :key="equipe.id" class="border-b last:border-0">
                                <td class="py-2 pr-4">{{ equipe.nome }}</td>
                                <td class="py-2 pr-4">{{ equipe.musicians_count }}</td>
                                <td class="py-2 pr-4">
                                    <Badge :color="equipe.ativo ? 'green' : 'gray'">
                                        {{ equipe.ativo ? 'Ativa' : 'Inativa' }}
                                    </Badge>
                                </td>
                                <td class="py-2 text-right space-x-2">
                                    <Link :href="route('equipes.edit', equipe.id)" class="text-indigo-600 hover:underline">Editar</Link>
                                    <button @click="remover(equipe)" class="text-red-600 hover:underline">Remover</button>
                                </td>
                            </tr>
                            <tr v-if="teams.length === 0">
                                <td colspan="4" class="py-6 text-center text-gray-500">Nenhuma equipe cadastrada.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
