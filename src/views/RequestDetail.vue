<template>
  <AppLayout>
    <div class="request-detail">
      <!-- Page Header -->
      <div class="page-header">
        <BaseButton variant="secondary" @click="goBack">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          {{ $t('common.back') }}
        </BaseButton>
        <h1>{{ $t('request.requestDetails') }}</h1>
        <div class="header-actions">
          <BaseButton
            v-if="request && (request.status === 'draft' || request.status === 'need_more_details')"
            variant="primary"
            @click="editRequest"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            {{ $t('common.edit') }}
          </BaseButton>
          <BaseButton
            v-if="request && request.status === 'rejected'"
            variant="primary"
            @click="showResubmitModal = true"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            {{ $t('request.resubmit') }}
          </BaseButton>
          <BaseButton variant="secondary" @click="loadRequest">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            {{ $t('common.refresh') }}
          </BaseButton>
        </div>
      </div>

      <!-- Resubmit Modal -->
      <div v-if="showResubmitModal" class="modal-overlay" @click.self="showResubmitModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ $t('request.resubmitRequest') }}</h3>
            <button class="modal-close" @click="showResubmitModal = false">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-description">{{ $t('request.resubmitDescription') }}</p>
            <div class="form-group">
              <label for="resubmission-reason">{{ $t('request.resubmissionReason') }}</label>
              <textarea
                id="resubmission-reason"
                v-model="resubmissionReason"
                :placeholder="$t('request.resubmissionReasonPlaceholder')"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <BaseButton variant="secondary" @click="showResubmitModal = false">
              {{ $t('common.cancel') }}
            </BaseButton>
            <BaseButton variant="primary" @click="resubmitRequest" :disabled="isSubmitting">
              <span v-if="isSubmitting">{{ $t('common.submitting') }}...</span>
              <span v-else>{{ $t('request.resubmit') }}</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Need More Details Warning -->
      <div v-if="request && request.status === 'need_more_details'" class="alert alert-warning">
        <div class="alert-content">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div>
            <strong>{{ $t('request.moreDetailsRequired') }}</strong>
            <p>{{ $t('request.moreDetailsMessage') }}</p>
          </div>
        </div>
      </div>

      <!-- Rejection Alert -->
      <div v-if="request && request.status === 'rejected'" class="alert alert-error">
        <div class="alert-content">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <strong>{{ $t('request.requestRejected') }}</strong>
            <p v-if="request.rejection_reason">{{ request.rejection_reason }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('request.loadingRequestDetails') }}</p>
      </div>

      <!-- Request Details -->
      <div v-else-if="request" class="request-details">
        <!-- Request Overview -->
        <BaseCard class="section-card">
          <h2 class="section-title">{{ $t('request.requestOverview') }}</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>{{ $t('request.requestId') }}</strong>
              <span class="request-id">#{{ request.id }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.title') }}</strong>
              <span>{{ request.title }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.submittedBy') }}</strong>
              <span>{{ request.user?.name }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.status') }}</strong>
              <BaseBadge :variant="getStatusVariant(request.status)">
                {{ $t('status.' + request.status) }}
              </BaseBadge>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.workflowPath') }}</strong>
              <span>{{ request.workflow_path?.name || $t('request.notAssigned') }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.currentLocation') }}</strong>
              <span>{{ request.current_department?.name || $t('common.notAvailable') }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.assignedTo') }}</strong>
              <span>{{ request.current_assignee?.name || $t('request.unassigned') }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('request.submittedAt') }}</strong>
              <span>{{ formatDate(request.submitted_at || request.created_at) }}</span>
            </div>
            <div v-if="request.expected_execution_date" class="info-item">
              <strong>{{ $t('request.expectedExecutionDate') }}</strong>
              <span>{{ formatDate(request.expected_execution_date) }}</span>
            </div>
            <div v-if="request.completed_at" class="info-item">
              <strong>{{ $t('request.completedAt') }}</strong>
              <span>{{ formatDate(request.completed_at) }}</span>
            </div>
            <div v-if="request.idea_ownership" class="info-item">
              <strong>{{ $t('request.ideaOwnership') }}</strong>
              <span :class="['ownership-badge', request.idea_ownership === 'shared' ? 'shared' : 'individual']">
                {{ request.idea_ownership === 'shared' ? $t('request.sharedIdea') : $t('request.individualIdea') }}
              </span>
            </div>
            <div v-if="request.ideaType" class="info-item">
              <strong>{{ $t('request.ideaType') }}</strong>
              <span class="idea-type-badge" :style="{ backgroundColor: request.ideaType.color + '20', color: request.ideaType.color, borderColor: request.ideaType.color }">
                {{ $i18n.locale === 'ar' ? request.ideaType.name_ar : request.ideaType.name }}
              </span>
            </div>
            <div class="info-item info-full">
              <strong>{{ $t('request.description') }}</strong>
              <p class="description">{{ request.description }}</p>
            </div>
            <div v-if="request.benefits" class="info-item info-full">
              <strong>{{ $t('request.benefits') }}</strong>
              <p class="description">{{ request.benefits }}</p>
            </div>
            <div v-if="request.additional_details" class="info-item info-full">
              <strong>{{ $t('request.additionalDetails') }}</strong>
              <p class="description">{{ request.additional_details }}</p>
            </div>
          </div>
        </BaseCard>

        <!-- Attachments -->
        <BaseCard v-if="request.attachments && request.attachments.length > 0" class="section-card">
          <h2 class="section-title">{{ $t('request.attachments') }} ({{ request.attachments.length }})</h2>
          <div class="attachments-list">
            <div v-for="attachment in request.attachments" :key="attachment.id" class="attachment-item">
              <div class="attachment-info">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                </svg>
                <span class="attachment-name">{{ attachment.file_name }}</span>
                <span v-if="attachment.file_size" class="attachment-size">{{ formatFileSize(attachment.file_size) }}</span>
              </div>
              <a :href="`${BASE_URL}/storage/${attachment.file_path}`" target="_blank" class="download-link">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                {{ $t('common.download') }}
              </a>
            </div>
          </div>
        </BaseCard>

        <!-- Collaborating Employees -->
        <BaseCard v-if="request.employees && request.employees.length > 0" class="section-card">
          <h2 class="section-title">{{ $t('request.collaboratingEmployees') }} ({{ request.employees.length }})</h2>
          <div class="employees-list">
            <div v-for="employee in request.employees" :key="employee.id" class="employee-item">
              <div class="employee-avatar">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="employee-info">
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
                    <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/>
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                  </svg>
                  {{ employee.employee_title }}
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Department A Evaluations -->
        <BaseCard v-if="request.evaluations && request.evaluations.length > 0" class="section-card">
          <h2 class="section-title">{{ $t('request.departmentAEvaluations') }}</h2>
          <div class="evaluations-list">
            <div v-for="evaluation in request.evaluations" :key="evaluation.id" class="evaluation-item">
              <div class="evaluation-question">
                <strong>{{ evaluation.question?.question }}</strong>
              </div>
              <div class="evaluation-answer">
                <BaseBadge :variant="evaluation.is_applied ? 'success' : 'error'">
                  {{ evaluation.is_applied ? $t('evaluations.applied') : $t('evaluations.notApplied') }}
                </BaseBadge>
              </div>
              <div v-if="evaluation.notes" class="evaluation-notes">
                <strong>{{ $t('evaluations.notes') }}:</strong> {{ evaluation.notes }}
              </div>
              <div class="evaluation-meta">
                {{ $t('evaluations.evaluatedBy') }} {{ evaluation.evaluated_by?.name }} {{ $t('evaluations.evaluatedOn') }} {{ formatDate(evaluation.created_at) }}
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Path Evaluations -->
        <BaseCard v-if="request.path_evaluations && request.path_evaluations.length > 0" class="section-card">
          <h2 class="section-title">{{ $t('request.pathEvaluations') }}</h2>
          <div class="evaluations-list">
            <div v-for="pathEval in request.path_evaluations" :key="pathEval.id" class="evaluation-item">
              <div class="evaluation-question">
                <strong>{{ pathEval.question?.question }}</strong>
              </div>
              <div class="evaluation-answer">
                <BaseBadge :variant="pathEval.is_applied ? 'success' : 'error'">
                  {{ pathEval.is_applied ? $t('evaluations.applied') : $t('evaluations.notApplied') }}
                </BaseBadge>
              </div>
              <div v-if="pathEval.notes" class="evaluation-notes">
                <strong>{{ $t('evaluations.notes') }}:</strong> {{ pathEval.notes }}
              </div>
              <div class="evaluation-meta">
                {{ $t('evaluations.evaluatedBy') }} {{ pathEval.evaluated_by?.name }} {{ $t('evaluations.evaluatedOn') }} {{ formatDate(pathEval.created_at) }}
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Transition History -->
        <BaseCard class="section-card">
          <h2 class="section-title">{{ $t('request.workflowHistory') }}</h2>

          <!-- Empty State -->
          <div v-if="!request.transitions || request.transitions.length === 0" class="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>{{ $t('request.noWorkflowHistory') }}</p>
          </div>

          <!-- Timeline -->
          <div v-else class="timeline">
            <div v-for="(transition, index) in request.transitions" :key="transition.id" class="timeline-item">
              <div class="timeline-marker">{{ request.transitions.length - index }}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <BaseBadge variant="info">
                    {{ formatAction(transition.action) }}
                  </BaseBadge>
                  <span class="timeline-date">{{ formatDate(transition.created_at) }}</span>
                </div>
                <div class="timeline-body">
                  <div v-if="transition.actioned_by" class="timeline-info">
                    <strong>{{ $t('workflow.by') }}:</strong> {{ transition.actioned_by?.name }}
                  </div>
                  <div v-if="transition.from_status || transition.to_status" class="timeline-info">
                    <strong>{{ $t('workflow.statusChange') }}:</strong>
                    <span class="status-change">
                      <span v-if="transition.from_status">{{ $t('status.' + transition.from_status) }}</span>
                      <span v-if="transition.from_status && transition.to_status"> → </span>
                      <span v-if="transition.to_status">{{ $t('status.' + transition.to_status) }}</span>
                    </span>
                  </div>
                  <div v-if="transition.from_department || transition.to_department" class="timeline-info">
                    <strong>{{ $t('workflow.department') }}:</strong>
                    <span class="status-change">
                      <span v-if="transition.from_department">{{ transition.from_department.name }}</span>
                      <span v-if="transition.from_department && transition.to_department"> → </span>
                      <span v-if="transition.to_department">{{ transition.to_department.name }}</span>
                    </span>
                  </div>
                  <div v-if="transition.to_user" class="timeline-info">
                    <strong>{{ $t('request.assignedTo') }}:</strong> {{ transition.to_user.name }}
                  </div>
                  <div v-if="transition.comments" class="timeline-comments">
                    <strong>{{ $t('workflow.comments') }}:</strong> {{ transition.comments }}
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
import { useAlert } from '../composables/useAlert'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
const { showSuccess, showError } = useAlert()

const request = ref(null)
const error = ref(null)
const isLoading = ref(true)
const showResubmitModal = ref(false)
const resubmissionReason = ref('')
const isSubmitting = ref(false)

onMounted(async () => {
  await loadRequest()
})

const loadRequest = async () => {
  try {
    isLoading.value = true
    error.value = null

    const requestId = route.params.id

    // Try the detailed endpoint first (includes evaluations), fall back to basic endpoint
    try {
      const response = await axios.get(`${API_URL}/workflow/requests/${requestId}/detail`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      request.value = response.data.request
    } catch (detailErr) {
      // If detailed endpoint fails (e.g., user doesn't have permission), try basic endpoint
      const response = await axios.get(`${API_URL}/requests/${requestId}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      request.value = response.data.request
    }
  } catch (err) {
    showError(err.response?.data?.message || t('request.loadFailed'))
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/requests')
  }
}

const editRequest = () => {
  router.push(`/requests/${route.params.id}/edit`)
}

const resubmitRequest = async () => {
  try {
    isSubmitting.value = true
    error.value = null

    const requestId = route.params.id
    await axios.post(`${API_URL}/requests/${requestId}/submit`, {
      resubmission_reason: resubmissionReason.value
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    showResubmitModal.value = false
    resubmissionReason.value = ''
    showSuccess(t('request.resubmitSuccess'))
    await loadRequest()
  } catch (err) {
    showError(err.response?.data?.message || t('request.resubmitFailed'))
  } finally {
    isSubmitting.value = false
  }
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

const formatAction = (action) => {
  if (!action) return t('common.notAvailable')
  const camelCaseAction = action.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  return t(`workflow.actions.${camelCaseAction}`)
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

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.request-detail {
  max-width: 1600px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.page-header h1 {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

/* Alert */
.alert {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-6);
  font-size: var(--font-size-sm);
}

.alert-error {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-200);
}

.alert-warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border: 1px solid var(--color-warning-200);
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
}

.alert-content svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content strong {
  display: block;
  margin-bottom: var(--spacing-1);
}

.alert-content p {
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

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-surface);
  border-top-color: var(--color-primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Section Card */
.section-card {
  margin-bottom: var(--spacing-6);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-6);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-4);
}

.info-item {
  background: var(--color-surface);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.info-item strong {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-2);
}

.info-item span {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.request-id {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600) !important;
}

.info-full {
  grid-column: 1 / -1;
}

.description {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

/* Ownership Badge */
.ownership-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.ownership-badge.shared {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.ownership-badge.individual {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

/* Idea Type Badge */
.idea-type-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border: 1px solid;
}

/* Attachments */
.attachments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.attachment-item:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.attachment-info svg {
  flex-shrink: 0;
  color: var(--color-gray-400);
}

.attachment-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  flex-shrink: 0;
}

.download-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary-600);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.download-link:hover {
  background: var(--color-primary-700);
}

.download-link svg {
  flex-shrink: 0;
}

/* Employees */
.employees-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-4);
}

.employee-item {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.employee-item:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--color-primary-300);
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.employee-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.employee-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.employee-detail {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.employee-detail svg {
  flex-shrink: 0;
  opacity: 0.7;
}

/* Evaluations */
.evaluations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.evaluation-item {
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.evaluation-question {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-3);
}

.evaluation-answer {
  margin-bottom: var(--spacing-3);
}

.evaluation-notes {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-2);
}

.evaluation-meta {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-2);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.empty-state svg {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Timeline */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  padding-bottom: var(--spacing-8);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  background: var(--color-primary-600);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  z-index: 1;
}

.timeline-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.timeline-date {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.timeline-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.timeline-info strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  margin-right: var(--spacing-1);
}

.status-change {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.timeline-comments {
  background: var(--color-background);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--spacing-6);
}

.modal-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
  line-height: var(--line-height-relaxed);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-textarea {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  resize: vertical;
  transition: all var(--transition-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--color-border);
}

/* RTL Support */
html[dir="rtl"] .timeline::before {
  left: auto;
  right: 20px;
}

html[dir="rtl"] .timeline-item {
  padding-left: 0;
  padding-right: 60px;
}

html[dir="rtl"] .timeline-marker {
  left: auto;
  right: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header h1 {
    text-align: left;
    order: -1;
    margin-bottom: var(--spacing-4);
  }

  .header-actions {
    justify-content: flex-end;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .employees-list {
    grid-template-columns: 1fr;
  }
}
</style>
