<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const user = computed(() => usePage().props.auth.user);
const isStaff = computed(() => ['admin', 'coordenador'].includes(user.value.role));
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <p class="text-gray-700 mb-6">Olá, {{ user.name }}!</p>

                    <div v-if="isStaff" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link :href="route('musicos.index')" class="p-4 border rounded-lg hover:bg-gray-50">
                            <h3 class="font-medium text-gray-900">Gerenciar Músicos</h3>
                            <p class="text-sm text-gray-500 mt-1">Cadastrar e editar músicos e instrumentos.</p>
                        </Link>
                        <Link :href="route('escalas.create')" class="p-4 border rounded-lg hover:bg-gray-50">
                            <h3 class="font-medium text-gray-900">Criar Escala</h3>
                            <p class="text-sm text-gray-500 mt-1">Montar a escala de uma celebração.</p>
                        </Link>
                        <Link :href="route('equipes.index')" class="p-4 border rounded-lg hover:bg-gray-50">
                            <h3 class="font-medium text-gray-900">Equipes</h3>
                            <p class="text-sm text-gray-500 mt-1">Gerenciar as equipes musicais.</p>
                        </Link>
                        <Link :href="route('disponibilidade.index')" class="p-4 border rounded-lg hover:bg-gray-50">
                            <h3 class="font-medium text-gray-900">Disponibilidade dos Músicos</h3>
                            <p class="text-sm text-gray-500 mt-1">Ver a disponibilidade informada por cada músico.</p>
                        </Link>
                    </div>

                    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link :href="route('escalas.index')" class="p-4 border rounded-lg hover:bg-gray-50">
                            <h3 class="font-medium text-gray-900">Minhas Próximas Escalas</h3>
                            <p class="text-sm text-gray-500 mt-1">Veja onde você está escalado e confirme presença.</p>
                        </Link>
                        <Link :href="route('disponibilidade.form')" class="p-4 border rounded-lg hover:bg-gray-50">
                            <h3 class="font-medium text-gray-900">Informar Disponibilidade</h3>
                            <p class="text-sm text-gray-500 mt-1">Diga em quais dias você costuma estar disponível.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
