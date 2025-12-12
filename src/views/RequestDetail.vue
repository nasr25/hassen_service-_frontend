<template>
  <AppLayout>
    <div class="request-detail">
      <!-- Header with Back Button and Actions -->
      <div class="page-header">
        <div class="header-left">
          <BaseButton variant="ghost" size="sm" @click="goBack">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
            {{ $t('common.backToRequests') }}
          </BaseButton>
        </div>
        <div class="header-right">
          <BaseButton
            v-if="request && request.status === 'need_more_details'"
            variant="primary"
            @click="editRequest"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            {{ $t('request.editAndResubmit') }}
          </BaseButton>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Need More Details Warning -->
      <div v-if="request && request.status === 'need_more_details'" class="alert alert-warning">
        <div class="alert-header">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <strong>{{ $t('request.moreDetailsRequired') }}</strong>
        </div>
        <p>{{ $t('request.moreDetailsMessage') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('request.loadingRequestDetails') }}</p>
      </div>

      <!-- Request Content -->
      <div v-else-if="request" class="request-content">
        <!-- Request Info Section -->
        <BaseCard class="info-card">
          <template #header>
            <div class="card-header-content">
              <div>
                <h2 class="request-title">{{ request.title }}</h2>
                <p class="request-id">#{{ request.id }}</p>
              </div>
              <BaseBadge :variant="getStatusVariant(request.status)">
                {{ formatStatus(request.status) }}
              </BaseBadge>
            </div>
          </template>

          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                <span>{{ $t('request.submittedBy') }}</span>
              </div>
              <div class="info-value">{{ request.user?.name }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>{{ $t('common.email') }}</span>
              </div>
              <div class="info-value">{{ request.user?.email }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <span>{{ $t('request.submittedAt') }}</span>
              </div>
              <div class="info-value">{{ formatDateTime(request.submitted_at || request.created_at) }}</div>
            </div>

            <div v-if="request.completed_at" class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ $t('request.completedAt') }}</span>
              </div>
              <div class="info-value">{{ formatDateTime(request.completed_at) }}</div>
            </div>

            <div v-if="request.expected_execution_date" class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <span>{{ $t('request.expectedExecutionDate') }}</span>
              </div>
              <div class="info-value">{{ formatDate(request.expected_execution_date) }}</div>
            </div>

            <div v-if="request.current_department && !['completed', 'rejected'].includes(request.status)" class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
                </svg>
                <span>{{ $t('request.currentDepartment') }}</span>
              </div>
              <div class="info-value">{{ request.current_department.name }}</div>
            </div>

            <div v-if="request.workflow_path" class="info-item">
              <div class="info-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                <span>{{ $t('request.workflowPath') }}</span>
              </div>
              <div class="info-value">{{ request.workflow_path.name }}</div>
            </div>
          </div>

          <!-- Description -->
          <div class="description-section">
            <h4>{{ $t('request.description') }}</h4>
            <p>{{ request.description }}</p>
          </div>

          <!-- Additional Details -->
          <div v-if="request.additional_details" class="description-section">
            <h4>{{ $t('request.additionalDetails') }}</h4>
            <p>{{ request.additional_details }}</p>
          </div>

          <!-- Rejection Reason -->
          <div v-if="request.rejection_reason" class="rejection-section">
            <div class="rejection-header">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <h4>{{ $t('request.rejectionReason') }}</h4>
            </div>
            <p>{{ request.rejection_reason }}</p>
          </div>
        </BaseCard>

        <!-- Collaborating Employees Section -->
        <BaseCard v-if="request.idea_type === 'shared' && request.employees && request.employees.length > 0" class="employees-card">
          <template #header>
            <div class="section-header">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <h3>{{ $t('request.collaboratingEmployees') }}</h3>
              <BaseBadge variant="blue">{{ request.employees.length }}</BaseBadge>
            </div>
          </template>

          <!-- Employees Grid -->
          <div class="employees-grid">
            <div v-for="(employee, index) in request.employees" :key="index" class="employee-card">
              <div class="employee-avatar">
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="employee-info-section">
                <div class="employee-name">{{ employee.employee_name }}</div>
                <div v-if="employee.employee_email" class="employee-detail">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  {{ employee.employee_email }}
                </div>
                <div v-if="employee.employee_department" class="employee-detail">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
                  </svg>
                  {{ employee.employee_department }}
                </div>
                <div v-if="employee.employee_title" class="employee-detail">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                  </svg>
                  {{ employee.employee_title }}
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Attachments Section -->
        <BaseCard v-if="request.attachments && request.attachments.length > 0" class="attachments-card">
          <template #header>
            <div class="section-header">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
              </svg>
              <h3>{{ $t('request.attachments') }}</h3>
              <BaseBadge variant="gray">{{ request.attachments.length }}</BaseBadge>
            </div>
          </template>

          <div class="attachments-list">
            <div v-for="attachment in request.attachments" :key="attachment.id" class="attachment-item">
              <div class="attachment-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.file_name }}</div>
                <div class="attachment-size">{{ formatFileSize(attachment.file_size) }}</div>
              </div>
              <a :href="`${BASE_URL}/storage/${attachment.file_path}`" target="_blank" class="attachment-download">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </BaseCard>

        <!-- Workflow History Section -->
        <BaseCard class="history-card">
          <template #header>
            <div class="section-header">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <h3>{{ $t('request.workflowHistory') }}</h3>
            </div>
          </template>

          <!-- Empty State -->
          <div v-if="!request.transitions || request.transitions.length === 0" class="empty-history">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>{{ $t('request.noWorkflowHistory') }}</p>
          </div>

          <!-- Timeline -->
          <div v-else class="timeline">
            <div v-for="(transition, index) in request.transitions" :key="transition.id" class="timeline-item">
              <div class="timeline-marker">
                <div :class="['marker-dot', `marker-${transition.action}`]"></div>
                <div v-if="index < request.transitions.length - 1" class="marker-line"></div>
              </div>

              <div class="timeline-content">
                <div class="timeline-header">
                  <div class="timeline-action-wrapper">
                    <span class="timeline-action">{{ formatAction(transition.action) }}</span>
                    <BaseBadge variant="gray" class="timeline-badge">
                      {{ formatStatus(transition.to_status) }}
                    </BaseBadge>
                  </div>
                  <span class="timeline-date">{{ formatDateTime(transition.created_at) }}</span>
                </div>

                <div class="timeline-details">
                  <div v-if="transition.actioned_by" class="detail-row">
                    <span class="detail-label">{{ $t('workflow.by') }}</span>
                    <span class="detail-value">{{ transition.actioned_by.name }} ({{ transition.actioned_by.email }})</span>
                  </div>

                  <div v-if="transition.from_department_id" class="detail-row">
                    <span class="detail-label">{{ $t('workflow.from') }}</span>
                    <span class="detail-value">{{ getDepartmentName(transition.from_department_id) }}</span>
                  </div>

                  <div v-if="transition.to_department" class="detail-row">
                    <span class="detail-label">{{ $t('workflow.to') }}</span>
                    <span class="detail-value">{{ transition.to_department.name }}</span>
                  </div>

                  <div v-if="transition.to_user_id" class="detail-row">
                    <span class="detail-label">{{ $t('workflow.assignedTo') }}</span>
                    <span class="detail-value">User ID {{ transition.to_user_id }}</span>
                  </div>

                  <div class="detail-row">
                    <span class="detail-label">{{ $t('workflow.statusChange') }}</span>
                    <div class="status-change">
                      <BaseBadge :variant="getStatusVariant(transition.from_status)" class="mini-badge">
                        {{ formatStatus(transition.from_status) }}
                      </BaseBadge>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                      <BaseBadge :variant="getStatusVariant(transition.to_status)" class="mini-badge">
                        {{ formatStatus(transition.to_status) }}
                      </BaseBadge>
                    </div>
                  </div>

                  <div v-if="transition.comments" class="transition-comments">
                    <span class="detail-label">{{ $t('workflow.comments') }}</span>
                    <p class="comment-text">{{ transition.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseBadge from '../components/BaseBadge.vue'
import { API_URL, BASE_URL } from '../config/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const request = ref(null)
const error = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  await loadRequest()
})

const loadRequest = async () => {
  try {
    isLoading.value = true
    error.value = null

    const requestId = route.params.id
    const response = await axios.get(`${API_URL}/requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    request.value = response.data.request
  } catch (err) {
    error.value = err.response?.data?.message || t('request.loadFailed')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/requests')
}

const editRequest = () => {
  router.push(`/requests/${route.params.id}/edit`)
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
  if (!status) return t('common.notAvailable')
  const statusKey = `status.${status}`
  return t(statusKey)
}

const formatAction = (action) => {
  if (!action) return t('common.notAvailable')
  // Convert snake_case to camelCase for translation key
  const camelCaseAction = action.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  const actionKey = `workflow.actions.${camelCaseAction}`
  return t(actionKey)
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

const formatDateTime = (dateString) => {
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

const formatFileSize = (bytes) => {
  if (!bytes) return t('common.zeroBytes')
  const k = 1024
  const sizes = [t('common.bytes'), t('common.kb'), t('common.mb'), t('common.gb')]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getDepartmentName = (deptId) => {
  // Try to find department name from transitions
  const transition = request.value?.transitions?.find(t => t.from_department_id === deptId)
  return transition?.from_department?.name || `${t('common.department')} ${deptId}`
}
</script>

<style scoped>
.request-detail {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-6);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

/* Alerts */
.alert {
  margin-bottom: var(--spacing-6);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.alert-header svg {
  flex-shrink: 0;
}

.alert-header strong {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.alert p {
  margin: 0;
  line-height: var(--line-height-relaxed);
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

/* Request Content */
.request-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

/* Info Card */
.info-card {
  padding: 0;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  padding-bottom: 0;
}

.request-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.request-id {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
  margin: 0;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
  padding: var(--spacing-6);
  padding-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.info-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.info-label svg {
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Description Section */
.description-section {
  padding: var(--spacing-6);
  padding-top: var(--spacing-5);
  border-top: 1px solid var(--color-border);
}

.description-section h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.description-section p {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Rejection Section */
.rejection-section {
  padding: var(--spacing-6);
  padding-top: var(--spacing-5);
  border-top: 1px solid var(--color-border);
  background: var(--color-error-50);
  margin: 0 var(--spacing-6) var(--spacing-6) var(--spacing-6);
  border-radius: var(--radius-lg);
}

.rejection-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.rejection-header svg {
  color: var(--color-error-600);
  flex-shrink: 0;
}

.rejection-header h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error-700);
  margin: 0;
}

.rejection-section p {
  font-size: var(--font-size-base);
  color: var(--color-error-700);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Attachments Card */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.section-header svg {
  color: var(--color-primary-600);
  flex-shrink: 0;
}

.section-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.attachment-item:hover {
  background: var(--color-gray-100);
  border-color: var(--color-primary-300);
}

.attachment-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.attachment-download {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  transition: all 0.2s;
  flex-shrink: 0;
}

.attachment-download:hover {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

/* History Card */
.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.empty-history svg {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.empty-history p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: var(--spacing-6);
  position: relative;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
  padding-top: 2px;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 3px solid var(--color-primary-600);
  background: var(--color-background);
  z-index: 1;
  flex-shrink: 0;
}

.marker-dot.marker-assign_path {
  border-color: var(--color-success-600);
}

.marker-dot.marker-assign {
  border-color: var(--color-info-600);
}

.marker-dot.marker-complete {
  border-color: var(--color-success-600);
}

.marker-dot.marker-reject {
  border-color: var(--color-error-600);
}

.marker-dot.marker-return_to_department {
  border-color: var(--color-warning-600);
}

.marker-dot.marker-request_details {
  border-color: var(--color-warning-600);
}

.marker-line {
  width: 2px;
  flex: 1;
  background: var(--color-border);
  margin-top: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.timeline-content {
  flex: 1;
  padding-bottom: var(--spacing-8);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.timeline-action-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.timeline-action {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-700);
}

.timeline-badge {
  font-size: var(--font-size-xs);
}

.timeline-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.timeline-details {
  background: var(--color-surface);
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.detail-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  min-width: 120px;
  flex-shrink: 0;
}

.detail-value {
  color: var(--color-text-primary);
  flex: 1;
}

.status-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.status-change svg {
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.mini-badge {
  font-size: var(--font-size-xs);
}

.transition-comments {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border);
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  font-style: italic;
  background: var(--color-background);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary-300);
  margin: 0;
}

/* Employees Section */
.employees-card {
  margin-top: var(--spacing-6);
}

.empty-employees {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.empty-employees svg {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.empty-employees p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.employee-card {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.employee-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.employee-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-100);
  border-radius: var(--radius-full);
  color: var(--color-primary-600);
}

.employee-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
}

.employee-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.employee-detail {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-tight);
}

.employee-detail svg {
  flex-shrink: 0;
  color: var(--color-gray-400);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-action-wrapper {
    flex-wrap: wrap;
  }

  .detail-label {
    min-width: 100px;
  }
}
</style>
