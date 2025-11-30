<template>
  <span :class="badgeClasses">
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'error', 'info', 'gray'].includes(value)
  }
})

const badgeClasses = computed(() => {
  return ['badge', `badge-${props.variant}`]
})
</script>
