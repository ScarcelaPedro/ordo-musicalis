<script setup>
const props = defineProps({
    options: {
        type: Array,
        required: true, // [{ id, nome }]
    },
    modelValue: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['update:modelValue']);

function toggle(id) {
    const selected = props.modelValue.includes(id)
        ? props.modelValue.filter((value) => value !== id)
        : [...props.modelValue, id];

    emit('update:modelValue', selected);
}
</script>

<template>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-200 rounded-md p-3">
        <label
            v-for="option in options"
            :key="option.id"
            class="flex items-center gap-2 text-sm text-gray-700"
        >
            <input
                type="checkbox"
                class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                :checked="modelValue.includes(option.id)"
                @change="toggle(option.id)"
            />
            {{ option.nome }}
        </label>
    </div>
</template>
