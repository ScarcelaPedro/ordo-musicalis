<script setup>
defineProps({
    color: {
        type: String,
        default: 'gray', // gray | green | yellow | red
    },
});

const colors = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
};
</script>

<template>
    <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        :class="colors[color] ?? colors.gray"
    >
        <slot />
    </span>
</template>
