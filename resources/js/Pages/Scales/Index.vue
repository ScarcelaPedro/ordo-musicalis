<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Badge from '@/Components/Badge.vue';
import Pagination from '@/Components/Pagination.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    scales: {
        type: Object,
        required: true,
    },
    teams: {
        type: Array,
        required: true,
    },
    filtros: {
        type: Object,
        required: true,
    },
});

const mes = ref(usePage().props.filtros.mes);
const teamId = ref(usePage().props.filtros.team_id);

function filtrar() {
    router.get(route('escalas.index'), { mes: mes.value, team_id: teamId.value }, { preserveState: true, replace: true });
}
</script>

<template>
    <Head title="Escalas" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Escalas</h2>
        </template>

        <div class="py-12">
            <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div class="flex gap-2">
                            <input type="month" v-model="mes" @change="filtrar" class="border-gray-300 rounded-md shadow-sm text-sm" />
                            <select v-model="teamId" @change="filtrar" class="border-gray-300 rounded-md shadow-sm text-sm">
                                <option value="">Todas as equipes</option>
                                <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
                            </select>
                        </div>

                        <Link :href="route('escalas.create')">
                            <PrimaryButton>Nova Escala</PrimaryButton>
                        </Link>
                    </div>

                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-500 uppercase border-b">
                            <tr>
                                <th class="py-2 pr-4">Data</th>
                                <th class="py-2 pr-4">Celebração</th>
                                <th class="py-2 pr-4">Equipe</th>
                                <th class="py-2 pr-4">Status</th>
                                <th class="py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="escala in scales.data" :key="escala.id" class="border-b last:border-0">
                                <td class="py-2 pr-4">{{ escala.data.substring(0, 10) }} {{ escala.horario }}</td>
                                <td class="py-2 pr-4">
                                    <Link :href="route('escalas.show', escala.id)" class="text-indigo-600 hover:underline">
                                        {{ escala.celebracao }}
                                    </Link>
                                </td>
                                <td class="py-2 pr-4">{{ escala.team?.nome || '—' }}</td>
                                <td class="py-2 pr-4">
                                    <Badge :color="escala.status === 'confirmada' ? 'green' : 'yellow'">
                                        {{ escala.status === 'confirmada' ? 'Confirmada' : 'Rascunho' }}
                                    </Badge>
                                </td>
                                <td class="py-2 text-right space-x-2">
                                    <Link :href="route('escalas.edit', escala.id)" class="text-indigo-600 hover:underline">Editar</Link>
                                </td>
                            </tr>
                            <tr v-if="scales.data.length === 0">
                                <td colspan="5" class="py-6 text-center text-gray-500">Nenhuma escala encontrada.</td>
                            </tr>
                        </tbody>
                    </table>

                    <Pagination :links="scales.links" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
