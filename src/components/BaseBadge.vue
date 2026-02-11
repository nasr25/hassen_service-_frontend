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
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const badgeClasses = computed(() => {
  return ['badge', `badge-${props.variant}`, `badge-${props.size}`]
})
</script>
