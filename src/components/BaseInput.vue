<template>
  <div class="form-group">
    <label v-if="label" class="form-label" :for="inputId">
      {{ label }}
      <span v-if="required" style="color: var(--color-error-500)">*</span>
    </label>

    <input
      v-if="type !== 'textarea'"
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="form-input"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />

    <textarea
      v-else
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      class="form-textarea"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    ></textarea>

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
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
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
  },
  rows: {
    type: Number,
    default: 4
  }
})

defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => {
  return `input-${Math.random().toString(36).substr(2, 9)}`
})
</script>
