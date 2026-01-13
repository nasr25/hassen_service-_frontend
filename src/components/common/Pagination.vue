<template>
  <div
    v-if="pagination.last_page > 1"
    class="pagination"
  ><button
      @click="goTo(pagination.current_page - 1)"
      :disabled="pagination.current_page === 1"
      class="btn-pagination"
    > {{ $t('common.previous') }}
    </button>
    <span class="pagination-info">
      {{ $t('audit.page') }}
      {{ pagination.current_page }} {{ $t('audit.of') }} {{ pagination.last_page }}
      ({{ $t('audit.total') }}: {{ pagination.total }})
    </span>
    <button
      @click="goTo(pagination.current_page + 1)"
      :disabled="pagination.current_page === pagination.last_page"
      class="btn-pagination"
    >
      {{ $t('common.next') }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  pagination: { type: Object, required: true },
});
const emit = defineEmits(["change"]);
const goTo = (page) => {
  emit("change", page);
};
</script>
<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-pagination {
  padding: 8px 16px;
  background: var(--color-primary, #02735e);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-pagination:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-pagination:not(:disabled):hover {
  background: var(--color-primary-dark, #015a4a);
}

.pagination-info {
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}
</style>
