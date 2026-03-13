<template>
  <div class="virtual-item">
    <BestiaryCard :mob="source" :hoverable="hoverable" @view="$emit('view', $event)" />
  </div>
</template>

<script setup>
import BestiaryCard from './BestiaryCard.vue'

defineProps({
  source: {
    type: Object,
    required: true
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view'])
</script>
