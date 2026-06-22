<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Badge from '@/Components/Badge.vue';
import Pagination from '@/Components/Pagination.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    musicians: {
        type: Object,
        required: true,
    },
    filtros: {
        type: Object,
        required: true,
    },
});

const busca = ref(usePage().props.filtros.busca);

function buscar() {
    router.get(route('musicos.index'), { busca: busca.value }, { preserveState: true, replace: true });
}

function remover(musico) {
    if (confirm(`Remover o músico "${musico.nome}"?`)) {
        router.delete(route('musicos.destroy', musico.id));
    }
}
</script>

<template>
    <Head title="Músicos" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Músicos</h2>
        </template>

        <div class="py-12">
            <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <form @submit.prevent="buscar" class="flex gap-2">
                            <TextInput v-model="busca" placeholder="Buscar por nome ou instrumento" class="w-64" />
                            <PrimaryButton type="submit">Buscar</PrimaryButton>
                        </form>

                        <Link :href="route('musicos.create')">
                            <PrimaryButton>Cadastrar Músico</PrimaryButton>
                        </Link>
                    </div>

                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-500 uppercase border-b">
                            <tr>
                                <th class="py-2 pr-4">Nome</th>
                                <th class="py-2 pr-4">Instrumentos</th>
                                <th class="py-2 pr-4">Telefone</th>
                                <th class="py-2 pr-4">Status</th>
                                <th class="py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="musico in musicians.data" :key="musico.id" class="border-b last:border-0">
                                <td class="py-2 pr-4">
                                    <Link :href="route('musicos.show', musico.id)" class="text-indigo-600 hover:underline">
                                        {{ musico.nome }}
                                    </Link>
                                </td>
                                <td class="py-2 pr-4">{{ musico.instruments.map((i) => i.nome).join(', ') || '—' }}</td>
                                <td class="py-2 pr-4">{{ musico.telefone || '—' }}</td>
                                <td class="py-2 pr-4">
                                    <Badge :color="musico.ativo ? 'green' : 'gray'">
                                        {{ musico.ativo ? 'Ativo' : 'Inativo' }}
                                    </Badge>
                                </td>
                                <td class="py-2 text-right space-x-2">
                                    <Link :href="route('musicos.edit', musico.id)" class="text-indigo-600 hover:underline">Editar</Link>
                                    <button @click="remover(musico)" class="text-red-600 hover:underline">Remover</button>
                                </td>
                            </tr>
                            <tr v-if="musicians.data.length === 0">
                                <td colspan="5" class="py-6 text-center text-gray-500">Nenhum músico encontrado.</td>
                            </tr>
                        </tbody>
                    </table>

                    <Pagination :links="musicians.links" />
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
