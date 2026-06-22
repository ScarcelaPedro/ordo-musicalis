<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';

defineProps({
    musicians: {
        type: Array,
        required: true,
    },
});

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const PERIODOS = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

function resumo(musician) {
    const porDia = {};

    musician.availabilities
        .filter((a) => a.tipo === 'recorrente_semanal' && a.disponivel)
        .forEach((a) => {
            porDia[a.dia_semana] ??= [];
            porDia[a.dia_semana].push(PERIODOS[a.periodo]);
        });

    return Object.entries(porDia)
        .map(([dia, periodos]) => `${DIAS[dia]} (${periodos.join(', ')})`)
        .join('; ');
}
</script>

<template>
    <Head title="Disponibilidade dos Músicos" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Disponibilidade dos Músicos</h2>
        </template>

        <div class="py-12">
            <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-500 uppercase border-b">
                            <tr>
                                <th class="py-2 pr-4">Músico</th>
                                <th class="py-2">Disponibilidade recorrente</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="m in musicians" :key="m.id" class="border-b last:border-0">
                                <td class="py-2 pr-4">{{ m.nome }}</td>
                                <td class="py-2 text-gray-600">{{ resumo(m) || 'Nenhuma disponibilidade informada' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
