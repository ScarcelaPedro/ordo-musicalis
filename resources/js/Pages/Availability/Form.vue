<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { reactive } from 'vue';

const props = defineProps({
    musician: {
        type: Object,
        default: null,
    },
});

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const PERIODOS = [
    { value: 'manha', label: 'Manhã' },
    { value: 'tarde', label: 'Tarde' },
    { value: 'noite', label: 'Noite' },
];

const grid = reactive(
    DIAS.map((_, diaSemana) =>
        PERIODOS.reduce((acc, p) => {
            acc[p.value] = props.musician?.availabilities.some(
                (a) => a.tipo === 'recorrente_semanal' && a.dia_semana === diaSemana && a.periodo === p.value
            ) ?? false;
            return acc;
        }, {})
    )
);

const form = useForm({ disponibilidades: [] });

function submit() {
    const disponibilidades = [];

    grid.forEach((periodos, diaSemana) => {
        PERIODOS.forEach((p) => {
            if (periodos[p.value]) {
                disponibilidades.push({ dia_semana: diaSemana, periodo: p.value });
            }
        });
    });

    form.transform(() => ({ disponibilidades })).post(route('disponibilidade.store'));
}
</script>

<template>
    <Head title="Minha Disponibilidade" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Minha Disponibilidade</h2>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <template v-if="musician">
                        <p class="text-sm text-gray-600 mb-4">
                            Marque os dias e períodos em que você normalmente está disponível para tocar/cantar.
                        </p>

                        <table class="w-full text-sm text-center">
                            <thead>
                                <tr>
                                    <th class="text-left py-2">Dia</th>
                                    <th v-for="p in PERIODOS" :key="p.value" class="py-2">{{ p.label }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(dia, index) in DIAS" :key="dia" class="border-t">
                                    <td class="text-left py-2">{{ dia }}</td>
                                    <td v-for="p in PERIODOS" :key="p.value" class="py-2">
                                        <input type="checkbox" v-model="grid[index][p.value]" class="rounded border-gray-300 text-indigo-600" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <PrimaryButton class="mt-6" :disabled="form.processing" @click="submit">Salvar disponibilidade</PrimaryButton>
                    </template>
                    <p v-else class="text-sm text-gray-600">
                        Seu perfil ainda não está vinculado a um cadastro de músico. Entre em contato com o coordenador.
                    </p>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
