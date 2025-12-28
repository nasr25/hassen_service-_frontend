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

      <!-- Requests Grid -->
      <div v-else class="requests-grid">
        <BaseCard v-for="request in requests" :key="request.id" class="request-card">
          <!-- Request Header -->
          <div class="request-header">
            <div class="request-title-section">
              <h3>{{ request.title }}</h3>
              <p class="request-id">#{{ request.id }}</p>
            </div>
            <BaseBadge :variant="getStatusVariant(request.status)">
              {{ $t('status.' + request.status) }}
            </BaseBadge>
          </div>

          <!-- Request Description -->
          <div v-if="request.description" class="request-description-section">
            <label class="section-label">{{ $t('request.ideaDescription') }}</label>
            <p class="request-description">{{ request.description }}</p>
          </div>

          <!-- Request Details Grid -->
          <div class="request-details-grid">
            <!-- Submitter -->
            <div class="detail-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('workflow.submittedBy') }}</span>
                <span class="detail-value">{{ request.user?.name || $t('common.notAvailable') }}</span>
              </div>
            </div>

            <!-- Workflow Path -->
            <div class="detail-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('request.workflowPath') }}</span>
                <span class="detail-value">{{ request.workflow_path?.name || $t('request.notAssigned') }}</span>
              </div>
            </div>

            <!-- Current Location -->
            <div class="detail-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('request.currentLocation') }}</span>
                <span class="detail-value">{{ request.current_department?.name || $t('common.notAvailable') }}</span>
              </div>
            </div>

            <!-- Assigned To -->
            <div class="detail-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('request.assignedTo') }}</span>
                <span class="detail-value">{{ request.current_assignee?.name || $t('request.unassigned') }}</span>
              </div>
            </div>

            <!-- Expected Execution Date -->
            <div v-if="request.expected_execution_date" class="detail-item expected-date-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('request.expectedDate') }}</span>
                <span class="detail-value">{{ formatDate(request.expected_execution_date) }}</span>
              </div>
            </div>

            <!-- Attachments Count -->
            <div v-if="request.attachments?.length > 0" class="detail-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('request.attachments') }}</span>
                <span class="detail-value">{{ request.attachments.length }} {{ $t('common.files') }}</span>
              </div>
            </div>

            <!-- Last Updated -->
            <div class="detail-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              <div class="detail-content">
                <span class="detail-label">{{ $t('request.lastUpdated') }}</span>
                <span class="detail-value">{{ formatDate(request.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Latest Transition Comment -->
          <div v-if="getLatestComment(request)" class="latest-comment-section">
            <div class="comment-header">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
              <span class="comment-title">{{ $t('workflow.latestComment') }}</span>
              <span v-if="getLatestTransition(request)" class="comment-by">
                {{ getLatestTransition(request).actionedBy?.name }}
              </span>
            </div>
            <div class="comment-content">
              <div class="comment-action-label">{{ getLatestActionLabel(request) }}</div>
              <p class="comment-text">{{ getLatestComment(request) }}</p>
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

          <!-- Action Button -->
          <div class="request-actions">
            <BaseButton variant="outline" size="sm" @click="viewHistory(request.id)">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
              </svg>
              {{ $t('request.viewHistory') }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
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
    in_progress: 'primary',
    need_more_details: 'warning',
    missing_requirement: 'warning',
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

// Helper functions to get latest transition comment
const getLatestTransition = (request) => {
  if (!request.transitions || request.transitions.length === 0) {
    return null
  }
  // Get the most recent transition with comments
  const transitionsWithComments = request.transitions.filter(t => t.comments)
  if (transitionsWithComments.length === 0) {
    return null
  }
  // Sort by created_at descending and get the first one
  return transitionsWithComments.sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  )[0]
}

const getLatestComment = (request) => {
  const latestTransition = getLatestTransition(request)
  return latestTransition?.comments || null
}

const getLatestActionLabel = (request) => {
  const latestTransition = getLatestTransition(request)
  if (!latestTransition) return ''

  // Map action types to labels
  const actionLabels = {
    'complete': t('workflow.returnedToDeptA'),
    'assign': t('workflow.assignedToEmployee'),
    'requestDetails': t('workflow.moreDetailsRequested'),
    'reject': t('workflow.rejected'),
    'submit': t('workflow.submitted')
  }

  return actionLabels[latestTransition.action] || latestTransition.action
}
</script>

<style scoped>
.department-a-requests {
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

/* Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: var(--spacing-6);
}

.request-card {
  display: flex;
  flex-direction: column;
  height: 100%;
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
}

.request-id {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
  margin: 0;
}

/* Request Description Section */
.request-description-section {
  margin-bottom: var(--spacing-5);
}

.section-label {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-2);
}

.request-description-section .request-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: 0;
  background: var(--color-surface);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--color-primary-500);
}

/* Request Details Grid */
.request-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.detail-item:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-300);
}

.detail-item > svg {
  color: var(--color-primary-600);
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Expected Date Item - Highlight */
.expected-date-item {
  background: var(--color-orange-50);
  border-color: var(--color-orange-300);
}

.expected-date-item:hover {
  background: var(--color-orange-100);
  border-color: var(--color-orange-400);
}

.expected-date-item svg {
  color: var(--color-orange-600) !important;
}

.expected-date-item .detail-label {
  color: var(--color-orange-700);
}

.expected-date-item .detail-value {
  color: var(--color-orange-900);
}

/* Latest Comment Section */
.latest-comment-section {
  margin-bottom: var(--spacing-5);
  background: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-300);
  border-left: 4px solid var(--color-yellow-600);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-yellow-100);
  border-bottom: 1px solid var(--color-yellow-200);
}

.comment-header svg {
  color: var(--color-yellow-700);
  flex-shrink: 0;
}

.comment-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-yellow-900);
  flex: 1;
}

.comment-by {
  font-size: var(--font-size-xs);
  color: var(--color-yellow-700);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-yellow-200);
  border-radius: var(--radius-full);
}

.comment-content {
  padding: var(--spacing-4);
}

.comment-action-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-yellow-800);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-2);
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Attachments Section */
.attachments-section {
  margin-top: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
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
  background: var(--color-background);
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

/* Request Actions */
.request-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .requests-grid {
    grid-template-columns: 1fr;
  }

  .request-actions {
    flex-direction: column;
  }
}
</style>
