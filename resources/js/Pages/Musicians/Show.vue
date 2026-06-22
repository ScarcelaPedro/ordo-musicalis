<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Badge from '@/Components/Badge.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    musician: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <Head :title="musician.nome" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">{{ musician.nome }}</h2>
                <Link :href="route('musicos.edit', musician.id)" class="text-sm text-indigo-600 hover:underline">Editar</Link>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt class="text-gray-500">Telefone</dt>
                            <dd>{{ musician.telefone || '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-500">E-mail</dt>
                            <dd>{{ musician.email || '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-500">Instrumentos</dt>
                            <dd>{{ musician.instruments.map((i) => i.nome).join(', ') || '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-500">Equipes</dt>
                            <dd>{{ musician.teams.map((t) => t.nome).join(', ') || '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-500">Status</dt>
                            <dd><Badge :color="musician.ativo ? 'green' : 'gray'">{{ musician.ativo ? 'Ativo' : 'Inativo' }}</Badge></dd>
                        </div>
                    </dl>
                </div>

                <div class="bg-white shadow sm:rounded-lg p-6">
                    <h3 class="font-medium text-gray-900 mb-3">Escalas</h3>
                    <ul v-if="musician.scales.length" class="divide-y">
                        <li v-for="escala in musician.scales" :key="escala.id" class="py-2 text-sm flex justify-between">
                            <span>{{ escala.celebracao }} — {{ escala.data }} {{ escala.horario }}</span>
                            <Link :href="route('escalas.show', escala.id)" class="text-indigo-600 hover:underline">ver</Link>
                        </li>
                    </ul>
                    <p v-else class="text-sm text-gray-500">Nenhuma escala registrada ainda.</p>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
