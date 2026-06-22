<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    musicians: {
        type: Array,
        required: true, // [{ id, nome, instruments: [{id, nome}], availabilities: [...] }]
    },
    modelValue: {
        type: Array,
        required: true, // [{ musician_id, instrument_id }]
    },
    data: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const weekday = computed(() => {
    if (!props.data) return null;
    const [y, m, d] = props.data.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
});

function isAvailable(musician) {
    if (weekday.value === null) return false;

    return musician.availabilities.some((a) => {
        if (!a.disponivel) return false;
        if (a.tipo === 'recorrente_semanal') return a.dia_semana === weekday.value;
        if (a.tipo === 'data_especifica') return a.data === props.data;
        return false;
    });
}

const musiciansById = computed(() => Object.fromEntries(props.musicians.map((m) => [m.id, m])));

const availableIds = computed(() => new Set(props.modelValue.map((row) => row.musician_id)));

const options = computed(() =>
    props.musicians
        .filter((m) => !availableIds.value.has(m.id))
        .map((m) => ({ ...m, disponivel: isAvailable(m) }))
        .sort((a, b) => Number(b.disponivel) - Number(a.disponivel))
);

const selectedToAdd = ref('');

function adicionar() {
    if (!selectedToAdd.value) return;

    const musician = musiciansById.value[selectedToAdd.value];

    emit('update:modelValue', [
        ...props.modelValue,
        { musician_id: musician.id, instrument_id: musician.instruments[0]?.id ?? null },
    ]);

    selectedToAdd.value = '';
}

function remover(musicianId) {
    emit('update:modelValue', props.modelValue.filter((row) => row.musician_id !== musicianId));
}

function setInstrument(musicianId, instrumentId) {
    emit(
        'update:modelValue',
        props.modelValue.map((row) =>
            row.musician_id === musicianId ? { ...row, instrument_id: instrumentId ? Number(instrumentId) : null } : row
        )
    );
}
</script>

<template>
    <div class="space-y-3">
        <div class="flex gap-2">
            <select v-model="selectedToAdd" class="border-gray-300 rounded-md shadow-sm w-full">
                <option value="">Selecionar músico...</option>
                <option v-for="m in options" :key="m.id" :value="m.id">
                    {{ m.nome }}{{ m.disponivel ? ' — disponível' : '' }}
                </option>
            </select>
            <button type="button" @click="adicionar" class="px-4 py-2 bg-gray-800 text-white text-sm rounded-md">
                Adicionar
            </button>
        </div>

        <ul class="divide-y border rounded-md">
            <li
                v-for="row in modelValue"
                :key="row.musician_id"
                class="flex items-center justify-between gap-3 p-3 text-sm"
            >
                <span class="flex-1">
                    {{ musiciansById[row.musician_id]?.nome }}
                    <span v-if="isAvailable(musiciansById[row.musician_id])" class="text-green-600 text-xs">(disponível)</span>
                </span>
                <select
                    class="border-gray-300 rounded-md shadow-sm text-sm"
                    :value="row.instrument_id"
                    @change="setInstrument(row.musician_id, $event.target.value)"
                >
                    <option :value="null">Sem instrumento</option>
                    <option v-for="i in musiciansById[row.musician_id]?.instruments" :key="i.id" :value="i.id">
                        {{ i.nome }}
                    </option>
                </select>
                <button type="button" @click="remover(row.musician_id)" class="text-red-600 hover:underline">
                    Remover
                </button>
            </li>
            <li v-if="modelValue.length === 0" class="p-3 text-sm text-gray-500">Nenhum músico escalado ainda.</li>
        </ul>
    </div>
</template>
