<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    links: {
        type: Array,
        required: true, // Laravel paginator "links" array: [{ url, label, active }]
    },
});
</script>

<template>
    <div v-if="links.length > 3" class="flex flex-wrap gap-1 mt-4">
        <template v-for="(link, index) in links" :key="index">
            <span
                v-if="!link.url"
                class="px-3 py-1 text-sm text-gray-400 border rounded"
                v-html="link.label"
            />
            <Link
                v-else
                :href="link.url"
                v-html="link.label"
                class="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                :class="{ 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-600': link.active }"
            />
        </template>
    </div>
</template>
