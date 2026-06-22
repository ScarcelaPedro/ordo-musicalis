<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';
import RepertoireItemRow from './Partials/RepertoireItemRow.vue';

const props = defineProps({
    scale: {
        type: Object,
        required: true,
    },
});

const repertoireForm = useForm({
    titulo: props.scale.repertoire?.titulo ?? `Repertório — ${props.scale.celebracao}`,
    observacoes: props.scale.repertoire?.observacoes ?? '',
});

function salvarRepertoire() {
    repertoireForm.put(route('escalas.repertorio.update', props.scale.id));
}

const itemForm = useForm({
    titulo_musica: '',
    tom: '',
    link_externo: '',
    arquivo_pdf: null,
});

function adicionarItem() {
    itemForm.post(route('repertorio-itens.store', props.scale.id), {
        onSuccess: () => itemForm.reset(),
    });
}
</script>

<template>
    <Head title="Editar Repertório" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Repertório — {{ scale.celebracao }}</h2>
        </template>

        <div class="py-12">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <form @submit.prevent="salvarRepertoire" class="space-y-4">
                        <div>
                            <InputLabel for="titulo" value="Título do repertório" />
                            <TextInput id="titulo" type="text" class="mt-1 block w-full" v-model="repertoireForm.titulo" required />
                            <InputError class="mt-2" :message="repertoireForm.errors.titulo" />
                        </div>
                        <div>
                            <InputLabel for="observacoes" value="Observações" />
                            <textarea
                                id="observacoes"
                                class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="2"
                                v-model="repertoireForm.observacoes"
                            />
                        </div>
                        <PrimaryButton :disabled="repertoireForm.processing">Salvar repertório</PrimaryButton>
                    </form>
                </div>

                <div v-if="scale.repertoire" class="bg-white shadow sm:rounded-lg p-6">
                    <h3 class="font-medium text-gray-900 mb-3">Músicas</h3>

                    <table class="w-full text-left">
                        <thead class="text-xs text-gray-500 uppercase border-b">
                            <tr>
                                <th class="py-2 pr-2">Ordem</th>
                                <th class="py-2 pr-2">Música</th>
                                <th class="py-2 pr-2">Tom</th>
                                <th class="py-2 pr-2">Link</th>
                                <th class="py-2 pr-2">PDF</th>
                                <th class="py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <RepertoireItemRow v-for="item in scale.repertoire.items" :key="item.id" :item="item" />
                        </tbody>
                    </table>

                    <form @submit.prevent="adicionarItem" class="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-2 items-start">
                        <TextInput v-model="itemForm.titulo_musica" placeholder="Nova música" required class="sm:col-span-2" />
                        <TextInput v-model="itemForm.tom" placeholder="Tom (ex.: Dó Maior)" />
                        <TextInput v-model="itemForm.link_externo" placeholder="Link (cifra/vídeo)" />
                        <input
                            type="file"
                            accept="application/pdf"
                            @input="itemForm.arquivo_pdf = $event.target.files[0]"
                            class="text-sm"
                        />
                        <PrimaryButton :disabled="itemForm.processing" class="sm:col-span-5 w-fit">Adicionar música</PrimaryButton>
                    </form>
                    <InputError class="mt-2" :message="itemForm.errors.titulo_musica" />
                </div>
                <p v-else class="text-sm text-gray-500">Salve o repertório acima para começar a adicionar músicas.</p>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
