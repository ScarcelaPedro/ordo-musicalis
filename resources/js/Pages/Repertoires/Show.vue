<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    scale: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <Head title="Repertório" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Repertório — {{ scale.celebracao }}</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <template v-if="scale.repertoire">
                        <h3 class="font-medium text-gray-900 mb-1">{{ scale.repertoire.titulo }}</h3>
                        <p v-if="scale.repertoire.observacoes" class="text-sm text-gray-600 mb-4">{{ scale.repertoire.observacoes }}</p>

                        <ol class="divide-y">
                            <li
                                v-for="item in scale.repertoire.items"
                                :key="item.id"
                                class="py-3 flex items-center justify-between"
                            >
                                <div>
                                    <p class="text-sm font-medium text-gray-900">{{ item.titulo_musica }}</p>
                                    <p v-if="item.tom" class="text-xs text-gray-500">Tom: {{ item.tom }}</p>
                                </div>
                                <div class="flex items-center gap-3 text-sm">
                                    <a v-if="item.link_externo" :href="item.link_externo" target="_blank" class="text-indigo-600 hover:underline">
                                        Link
                                    </a>
                                    <a v-if="item.arquivo_pdf_path" :href="route('repertorio-itens.download', item.id)" class="text-indigo-600 hover:underline">
                                        Baixar PDF
                                    </a>
                                </div>
                            </li>
                        </ol>
                        <p v-if="scale.repertoire.items.length === 0" class="text-sm text-gray-500">Nenhuma música cadastrada ainda.</p>
                    </template>
                    <p v-else class="text-sm text-gray-500">O repertório desta celebração ainda não foi cadastrado.</p>

                    <Link :href="route('escalas.show', scale.id)" class="text-sm text-indigo-600 hover:underline mt-6 inline-block">
                        ← Voltar para a escala
                    </Link>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
