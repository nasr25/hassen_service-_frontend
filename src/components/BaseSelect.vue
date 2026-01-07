<template>
  <div class="form-group">
    <label v-if="label" class="form-label" :for="selectId">
      {{ label }}
      <span v-if="required" style="color: var(--color-error-500)">*</span>
    </label>

    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="form-select"
      :class="{ 'has-error': error }"
      @change="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <span v-if="error" class="form-error">{{ error }}</span>
    <span v-else-if="help" class="form-help">{{ help }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  help: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'blur'])

const selectId = computed(() => {
  return `select-${Math.random().toString(36).substr(2, 9)}`
})
</script>
