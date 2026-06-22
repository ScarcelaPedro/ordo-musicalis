<script setup>
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import ScaleMusicianPicker from '@/Components/ScaleMusicianPicker.vue';
import TextInput from '@/Components/TextInput.vue';

defineProps({
    form: {
        type: Object,
        required: true,
    },
    teams: {
        type: Array,
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <InputLabel for="data" value="Data" />
                <TextInput id="data" type="date" class="mt-1 block w-full" v-model="form.data" required />
                <InputError class="mt-2" :message="form.errors.data" />
            </div>

            <div>
                <InputLabel for="horario" value="Horário" />
                <TextInput id="horario" type="time" class="mt-1 block w-full" v-model="form.horario" required />
                <InputError class="mt-2" :message="form.errors.horario" />
            </div>
        </div>

        <div>
            <InputLabel for="celebracao" value="Celebração" />
            <TextInput
                id="celebracao"
                type="text"
                class="mt-1 block w-full"
                v-model="form.celebracao"
                placeholder="Ex.: Missa Dominical"
                required
            />
            <InputError class="mt-2" :message="form.errors.celebracao" />
        </div>

        <div>
            <InputLabel for="team_id" value="Equipe responsável" />
            <select id="team_id" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" v-model="form.team_id">
                <option :value="null">Sem equipe definida</option>
                <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.nome }}</option>
            </select>
            <InputError class="mt-2" :message="form.errors.team_id" />
        </div>

        <div>
            <InputLabel for="status" value="Status" />
            <select id="status" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" v-model="form.status">
                <option value="rascunho">Rascunho</option>
                <option value="confirmada">Confirmada</option>
            </select>
            <InputError class="mt-2" :message="form.errors.status" />
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

        <div>
            <InputLabel value="Músicos escalados" />
            <ScaleMusicianPicker :musicians="musicians" v-model="form.musicians" :data="form.data" class="mt-1" />
            <InputError class="mt-2" :message="form.errors.musicians" />
        </div>

        <div class="flex items-center gap-4">
            <PrimaryButton :disabled="form.processing">{{ submitLabel }}</PrimaryButton>
        </div>
    </form>
</template>
