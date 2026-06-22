<script setup>
import InputError from '@/Components/InputError.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});

const form = useForm({
    titulo_musica: props.item.titulo_musica,
    tom: props.item.tom,
    link_externo: props.item.link_externo,
    ordem: props.item.ordem,
    arquivo_pdf: null,
});

function salvar() {
    form.put(route('repertorio-itens.update', props.item.id));
}

function remover() {
    if (confirm(`Remover "${props.item.titulo_musica}" do repertório?`)) {
        form.delete(route('repertorio-itens.destroy', props.item.id));
    }
}
</script>

<template>
    <tr class="border-b align-top">
        <td class="py-2 pr-2 w-16">
            <input type="number" v-model="form.ordem" class="w-16 border-gray-300 rounded-md shadow-sm text-sm" />
        </td>
        <td class="py-2 pr-2">
            <input type="text" v-model="form.titulo_musica" class="w-full border-gray-300 rounded-md shadow-sm text-sm" />
            <InputError :message="form.errors.titulo_musica" />
        </td>
        <td class="py-2 pr-2 w-24">
            <input type="text" v-model="form.tom" class="w-full border-gray-300 rounded-md shadow-sm text-sm" />
        </td>
        <td class="py-2 pr-2">
            <input type="url" v-model="form.link_externo" placeholder="Link (cifra/vídeo)" class="w-full border-gray-300 rounded-md shadow-sm text-sm" />
        </td>
        <td class="py-2 pr-2">
            <a v-if="item.arquivo_pdf_path" :href="route('repertorio-itens.download', item.id)" class="text-indigo-600 hover:underline text-xs block mb-1">
                Baixar PDF atual
            </a>
            <input type="file" accept="application/pdf" @input="form.arquivo_pdf = $event.target.files[0]" class="text-xs w-full" />
            <InputError :message="form.errors.arquivo_pdf" />
        </td>
        <td class="py-2 text-right whitespace-nowrap">
            <button type="button" @click="salvar" class="text-indigo-600 hover:underline text-sm mr-2">Salvar</button>
            <button type="button" @click="remover" class="text-red-600 hover:underline text-sm">Remover</button>
        </td>
    </tr>
</template>
