<template>
  <AppLayout>
    <div class="my-requests">
      <!-- Header Actions -->
      <div class="page-header">
        <div>
          <h1>{{ $t('nav.myRequests') }}</h1>
          <p>{{ $t('dashboard.myRequests.description') }}</p>
        </div>
        <div class="header-actions">
          <BaseButton variant="secondary" @click="loadRequests">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            {{ $t('common.refresh') }}
          </BaseButton>
          <BaseButton variant="primary" @click="createNew">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
            </svg>
            {{ $t('request.newRequest') }}
          </BaseButton>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="requests.length === 0" class="empty-state-card">
        <div class="empty-state">
          <svg width="96" height="96" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h2>{{ $t('request.noRequests') }}</h2>
          <p>{{ $t('request.noRequestsMessage') }}</p>
          <BaseButton variant="primary" size="lg" @click="createNew">
            {{ $t('request.newRequest') }}
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Requests List -->
      <div v-else>
        <!-- Filter Bar -->
        <div class="filter-bar">
          <button
            v-for="status in statuses"
            :key="status.value"
            @click="filterStatus = status.value"
            :class="['filter-chip', { active: filterStatus === status.value }]"
          >
            {{ status.label }}
            <span v-if="status.count > 0" class="count">{{ status.count }}</span>
          </button>
        </div>

        <!-- Requests Grid -->
        <div class="requests-grid">
          <BaseCard
            v-for="request in filteredRequests"
            :key="request.id"
            class="request-card"
            @click="viewDetails(request.id)"
          >
            <div class="request-header">
              <div class="request-title-section">
                <h3>{{ request.title }}</h3>
                <p class="request-id">#{{ request.id }}</p>
              </div>
              <BaseBadge :variant="getStatusVariant(request.status)">
                {{ formatStatus(request.status) }}
              </BaseBadge>
            </div>

            <p class="request-description">{{ truncate(request.description, 120) }}</p>

            <div class="request-footer">
              <div class="request-meta">
                <div class="meta-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ formatDate(request.submitted_at || request.created_at) }}</span>
                </div>

                <div v-if="request.current_department" class="meta-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ request.current_department.name }}</span>
                </div>

                <div v-if="request.expected_execution_date" class="meta-item expected-date">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ $t('request.expectedDate') }}: {{ formatDate(request.expected_execution_date) }}</span>
                </div>

                <div v-if="request.attachments && request.attachments.length > 0" class="meta-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ request.attachments.length }} {{ $t('request.attachments') }}</span>
                </div>
              </div>

              <!-- Attachments List -->
              <div v-if="request.attachments && request.attachments.length > 0" class="attachments-section">
                <div class="attachments-header">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ $t('request.attachments') }}:</span>
                </div>
                <div class="attachments-list">
                  <a v-for="attachment in request.attachments" :key="attachment.id"
                     :href="`${BASE_URL}/storage/${attachment.file_path}`"
                     target="_blank"
                     class="attachment-item">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="attachment-name">{{ attachment.file_name }}</span>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <button class="view-btn" @click.stop="viewDetails(request.id)">
                {{ $t('request.viewDetails') }}
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseBadge from '../components/BaseBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const requests = ref([])
const error = ref(null)
const isLoading = ref(true)
const filterStatus = ref('all')

import { API_URL, BASE_URL } from '../config/api'

const getStatusCount = (status) => {
  if (status === 'all') return requests.value.length
  return requests.value.filter(r => r.status === status).length
}

const statuses = computed(() => [
  { label: t('common.all'), value: 'all', count: getStatusCount('all') },
  { label: t('status.draft'), value: 'draft', count: getStatusCount('draft') },
  { label: t('status.pending'), value: 'pending', count: getStatusCount('pending') },
  { label: t('status.in_review'), value: 'in_review', count: getStatusCount('in_review') },
  { label: t('status.need_more_details'), value: 'need_more_details', count: getStatusCount('need_more_details') },
  { label: t('status.approved'), value: 'approved', count: getStatusCount('approved') },
  { label: t('status.rejected'), value: 'rejected', count: getStatusCount('rejected') },
  { label: t('status.completed'), value: 'completed', count: getStatusCount('completed') }
])

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') {
    return requests.value
  }
  return requests.value.filter(r => r.status === filterStatus.value)
})

onMounted(async () => {
  await loadRequests()
})

const loadRequests = async () => {
  try {
    isLoading.value = true
    console.log('Loading requests with token:', authStore.token ? 'Token exists' : 'No token')
    console.log('API URL:', `${API_URL}/requests`)

    const response = await axios.get(`${API_URL}/requests`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    console.log('Requests response:', response.data)
    requests.value = response.data.requests
  } catch (err) {
    console.error('Failed to load requests:', err)
    console.error('Error response:', err.response?.data)
    error.value = err.response?.data?.message || err.message || 'Failed to load requests'
  } finally {
    isLoading.value = false
  }
}

const createNew = () => {
  router.push('/requests/new')
}

const viewDetails = (id) => {
  router.push(`/requests/${id}`)
}

const getStatusVariant = (status) => {
  const variants = {
    draft: 'gray',
    pending: 'warning',
    in_review: 'info',
    in_progress: 'primary',
    need_more_details: 'warning',
    missing_requirement: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'success'
  }
  return variants[status] || 'gray'
}

const formatStatus = (status) => {
  return t(`status.${status}`)
}

const formatDate = (dateString) => {
  if (!dateString) return t('common.notAvailable')
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>

<style scoped>
.my-requests {
  max-width: 1400px;
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

.header-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
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

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
  padding: var(--spacing-4);
  background: var(--color-background);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.filter-chip:hover {
  background: var(--color-gray-100);
  border-color: var(--color-gray-300);
}

.filter-chip.active {
  background: var(--color-primary-600);
  color: white;
  border-color: var(--color-primary-600);
}

.filter-chip .count {
  padding: 2px var(--spacing-2);
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  min-width: 20px;
  text-align: center;
}

.filter-chip.active .count {
  background: rgba(255, 255, 255, 0.2);
}

/* Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-6);
}

.request-card {
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.request-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-300);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.request-title-section {
  flex: 1;
  min-width: 0;
}

.request-title-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-id {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
  margin: 0;
}

.request-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-4);
  flex: 1;
}

.request-footer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.request-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.meta-item svg {
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.meta-item.expected-date {
  color: var(--color-orange-700);
  font-weight: var(--font-weight-medium);
}

.meta-item.expected-date svg {
  color: var(--color-orange-500);
}

/* Attachments Section */
.attachments-section {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.attachments-header svg {
  color: var(--color-primary-600);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.attachment-item {
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

.attachment-item:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
  color: var(--color-primary-700);
}

.attachment-item svg:first-child {
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.attachment-item svg:last-child {
  color: var(--color-primary-600);
  flex-shrink: 0;
  margin-left: auto;
}

.attachment-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary-600);
  cursor: pointer;
  transition: all var(--transition-fast);
  width: 100%;
}

.view-btn:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .requests-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    overflow-x: auto;
    flex-wrap: nowrap;
  }
}
</style>
