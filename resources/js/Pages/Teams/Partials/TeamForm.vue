<script setup>
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import MultiSelect from '@/Components/MultiSelect.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';

defineProps({
    form: {
        type: Object,
        required: true,
    },
    musicians: {
        type: Array,
        required: true,
    },
    submitLabel: {
        type: String,
        default: 'Salvar',
    },
});

defineEmits(['submit']);
</script>

<template>
    <form @submit.prevent="$emit('submit')" class="space-y-6">
        <div>
            <InputLabel for="nome" value="Nome da equipe" />
            <TextInput id="nome" type="text" class="mt-1 block w-full" v-model="form.nome" required autofocus />
            <InputError class="mt-2" :message="form.errors.nome" />
        </div>

        <div>
            <InputLabel for="descricao" value="Descrição" />
            <textarea
                id="descricao"
                class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                rows="3"
                v-model="form.descricao"
            />
            <InputError class="mt-2" :message="form.errors.descricao" />
        </div>

        <div>
            <InputLabel value="Músicos da equipe" />
            <MultiSelect :options="musicians" v-model="form.musicians" class="mt-1" />
            <InputError class="mt-2" :message="form.errors.musicians" />
        </div>

        <div class="flex items-center gap-2">
            <input id="ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" v-model="form.ativo" />
            <InputLabel for="ativo" value="Ativa" class="!mb-0" />
        </div>

        <div class="flex items-center gap-4">
            <PrimaryButton :disabled="form.processing">{{ submitLabel }}</PrimaryButton>
        </div>
    </form>
</template>
