<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import Badge from '@/Components/Badge.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({
    scale: {
        type: Object,
        required: true,
    },
});

const user = computed(() => usePage().props.auth.user);

const minhaPresencaPendente = computed(() => {
    const meuVinculo = props.scale.musicians.find((m) => m.user_id === user.value.id);
    return meuVinculo && !meuVinculo.pivot.confirmado;
});

function confirmarPresenca() {
    router.patch(route('escalas.confirmar', props.scale.id));
}
</script>

<template>
    <Head :title="scale.celebracao" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">{{ scale.celebracao }}</h2>
                <Link :href="route('escalas.edit', scale.id)" class="text-sm text-indigo-600 hover:underline">Editar</Link>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div class="bg-white shadow sm:rounded-lg p-6">
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <dt class="text-gray-500">Data</dt>
                            <dd>{{ scale.data.substring(0, 10) }} às {{ scale.horario }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-500">Equipe</dt>
                            <dd>{{ scale.team?.nome || '—' }}</dd>
                        </div>
                        <div>
                            <dt class="text-gray-500">Status</dt>
                            <dd>
                                <Badge :color="scale.status === 'confirmada' ? 'green' : 'yellow'">
                                    {{ scale.status === 'confirmada' ? 'Confirmada' : 'Rascunho' }}
                                </Badge>
                            </dd>
                        </div>
                    </dl>

                    <p v-if="scale.observacoes" class="text-sm text-gray-600 mt-4">{{ scale.observacoes }}</p>

                    <div v-if="minhaPresencaPendente" class="mt-4">
                        <PrimaryButton @click="confirmarPresenca">Confirmar minha presença</PrimaryButton>
                    </div>
                </div>

                <div class="bg-white shadow sm:rounded-lg p-6">
                    <h3 class="font-medium text-gray-900 mb-3">Músicos escalados</h3>
                    <ul v-if="scale.musicians.length" class="divide-y">
                        <li v-for="m in scale.musicians" :key="m.id" class="py-2 text-sm flex items-center justify-between">
                            <span>{{ m.nome }} — {{ m.instruments.find((i) => i.id === m.pivot.instrument_id)?.nome || 'instrumento não definido' }}</span>
                            <Badge :color="m.pivot.confirmado ? 'green' : 'gray'">
                                {{ m.pivot.confirmado ? 'Confirmado' : 'Pendente' }}
                            </Badge>
                        </li>
                    </ul>
                    <p v-else class="text-sm text-gray-500">Nenhum músico escalado ainda.</p>
                </div>

                <div class="bg-white shadow sm:rounded-lg p-6">
                    <h3 class="font-medium text-gray-900 mb-3">Repertório</h3>
                    <Link
                        v-if="scale.repertoire"
                        :href="route('escalas.repertorio.show', scale.id)"
                        class="text-indigo-600 hover:underline text-sm"
                    >
                        Ver repertório desta celebração
                    </Link>
                    <Link v-else :href="route('escalas.repertorio.edit', scale.id)" class="text-indigo-600 hover:underline text-sm">
                        Cadastrar repertório
                    </Link>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
