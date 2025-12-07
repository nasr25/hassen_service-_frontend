<template>
  <AppLayout>
    <div class="department-a-requests">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>{{ $t('workflow.allRequestsTitle') }}</h1>
          <p>{{ $t('workflow.allRequestsSubtitle') }}</p>
        </div>
        <BaseButton variant="secondary" @click="loadRequests">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          {{ $t('common.refresh') }}
        </BaseButton>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('messages.loading.requests') }}</p>
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="requests.length === 0" class="empty-state-card">
        <div class="empty-state">
          <svg width="96" height="96" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          <h2>{{ $t('messages.empty.noRequestsFound') }}</h2>
        </div>
      </BaseCard>

      <!-- Requests Table -->
      <BaseCard v-else class="table-card">
        <div class="table-container">
          <table class="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ $t('request.title') }}</th>
                <th>{{ $t('request.submittedBy') }}</th>
                <th>{{ $t('request.workflowPath') }}</th>
                <th>{{ $t('request.currentLocation') }}</th>
                <th>{{ $t('request.assignedTo') }}</th>
                <th>{{ $t('request.status') }}</th>
                <th>{{ $t('request.expectedDate') }}</th>
                <th>{{ $t('request.attachments') }}</th>
                <th>{{ $t('request.lastUpdated') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td class="id-cell">#{{ request.id }}</td>
                <td class="title-cell">{{ request.title }}</td>
                <td>{{ request.user?.name || $t('common.notAvailable') }}</td>
                <td>{{ request.workflow_path?.name || $t('request.notAssigned') }}</td>
                <td>{{ request.current_department?.name || $t('common.notAvailable') }}</td>
                <td>{{ request.current_assignee?.name || $t('request.unassigned') }}</td>
                <td>
                  <BaseBadge :variant="getStatusVariant(request.status)">
                    {{ $t('status.' + request.status) }}
                  </BaseBadge>
                </td>
                <td class="expected-date-cell">
                  <span v-if="request.expected_execution_date" class="expected-date-badge">
                    {{ formatDate(request.expected_execution_date) }}
                  </span>
                  <span v-else class="no-data">—</span>
                </td>
                <td class="attachments-cell">
                  <div v-if="request.attachments && request.attachments.length > 0" class="attachments-list">
                    <a v-for="attachment in request.attachments" :key="attachment.id"
                       :href="`${BASE_URL}/storage/${attachment.file_path}`"
                       target="_blank"
                       class="attachment-link"
                       :title="attachment.file_name">
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                      </svg>
                      <span class="attachment-name">{{ attachment.file_name }}</span>
                    </a>
                  </div>
                  <span v-else class="no-data">—</span>
                </td>
                <td>{{ formatDate(request.updated_at) }}</td>
                <td class="actions-cell">
                  <BaseButton variant="outline" size="sm" @click="viewHistory(request.id)">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                    </svg>
                    {{ $t('request.viewHistory') }}
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseBadge from '../components/BaseBadge.vue'
import { API_URL, BASE_URL } from '../config/api'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const requests = ref([])
const error = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  await loadRequests()
})

const loadRequests = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await axios.get(`${API_URL}/workflow/all-requests`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    requests.value = response.data.requests
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToLoadRequests')
  } finally {
    isLoading.value = false
  }
}

const viewHistory = (requestId) => {
  router.push(`/request-history/${requestId}`)
}

const getStatusVariant = (status) => {
  const variants = {
    draft: 'gray',
    pending: 'warning',
    in_review: 'info',
    need_more_details: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'success'
  }
  return variants[status] || 'gray'
}

const formatDate = (dateString) => {
  if (!dateString) return t('common.notAvailable')
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.department-a-requests {
  max-width: 1600px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.page-header p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-20);
  gap: var(--spacing-4);
}

.loading-state p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Empty State */
.empty-state-card {
  padding: var(--spacing-12);
}

.empty-state {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.empty-state svg {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-6);
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

/* Table Card */
.table-card {
  padding: 0;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.requests-table thead {
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
}

.requests-table th {
  padding: var(--spacing-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.requests-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.requests-table tbody tr:hover {
  background: var(--color-surface);
}

.requests-table td {
  padding: var(--spacing-4);
  color: var(--color-text-secondary);
}

.id-cell {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600);
  font-family: var(--font-family-mono);
}

.title-cell {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expected-date-cell {
  white-space: nowrap;
}

.expected-date-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-warning-700);
}

.no-data {
  color: var(--color-gray-400);
  font-size: var(--font-size-base);
}

/* Attachments Cell */
.attachments-cell {
  max-width: 250px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.attachment-link:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.attachment-link svg {
  flex-shrink: 0;
  color: var(--color-gray-400);
}

.attachment-link:hover svg {
  color: var(--color-primary-600);
}

.attachment-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .table-container {
    border-radius: 0;
  }
}
</style>
