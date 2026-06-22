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
    instruments: {
        type: Array,
        required: true,
    },
    teams: {
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
            <InputLabel for="nome" value="Nome" />
            <TextInput id="nome" type="text" class="mt-1 block w-full" v-model="form.nome" required autofocus />
            <InputError class="mt-2" :message="form.errors.nome" />
        </div>

        <div>
            <InputLabel for="telefone" value="Telefone" />
            <TextInput id="telefone" type="text" class="mt-1 block w-full" v-model="form.telefone" />
            <InputError class="mt-2" :message="form.errors.telefone" />
        </div>

        <div>
            <InputLabel for="email" value="E-mail" />
            <TextInput id="email" type="email" class="mt-1 block w-full" v-model="form.email" />
            <InputError class="mt-2" :message="form.errors.email" />
        </div>

        <div>
            <InputLabel value="Instrumentos" />
            <MultiSelect :options="instruments" v-model="form.instruments" class="mt-1" />
            <InputError class="mt-2" :message="form.errors.instruments" />
        </div>

        <div>
            <InputLabel value="Equipes" />
            <MultiSelect :options="teams" v-model="form.teams" class="mt-1" />
            <InputError class="mt-2" :message="form.errors.teams" />
        </div>

        <div>
            <InputLabel for="observacoes" value="Observações" />
            <textarea
                id="observacoes"
                class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                rows="3"
                v-model="form.observacoes"
            />
            <InputError class="mt-2" :message="form.errors.observacoes" />
        </div>

        <div class="flex items-center gap-2">
            <input id="ativo" type="checkbox" class="rounded border-gray-300 text-indigo-600" v-model="form.ativo" />
            <InputLabel for="ativo" value="Ativo" class="!mb-0" />
        </div>

        <div class="flex items-center gap-4">
            <PrimaryButton :disabled="form.processing">{{ submitLabel }}</PrimaryButton>
        </div>
    </form>
</template>
