<template>
  <AppLayout>
    <div class="request-history">
      <!-- Page Header -->
      <div class="page-header">
        <BaseButton variant="secondary" @click="goBack">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          {{ $t('requestHistory.backToAllRequests') }}
        </BaseButton>
        <h1>{{ $t('request.requestHistory') }}</h1>
        <BaseButton variant="secondary" @click="loadRequest">
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
        <p>{{ $t('requestHistory.loadingDetails') }}</p>
      </div>

      <!-- Request Details -->
      <div v-else-if="request" class="request-details">
        <!-- Request Overview -->
        <BaseCard class="section-card">
          <h2 class="section-title">{{ $t('requestHistory.requestOverview') }}</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>{{ $t('requestHistory.requestId') }}</strong>
              <span class="request-id">#{{ request.id }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.title') }}</strong>
              <span>{{ request.title }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.submittedBy') }}</strong>
              <span>{{ request.user?.name }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.status') }}</strong>
              <BaseBadge :variant="getStatusVariant(request.status)">
                {{ $t('status.' + request.status) }}
              </BaseBadge>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.workflowPath') }}</strong>
              <span>{{ request.workflow_path?.name || $t('request.notAssigned') }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.currentLocation') }}</strong>
              <span>{{ request.current_department?.name || $t('common.notAvailable') }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.assignedTo') }}</strong>
              <span>{{ request.current_assignee?.name || $t('request.unassigned') }}</span>
            </div>
            <div class="info-item">
              <strong>{{ $t('requestHistory.submittedAt') }}</strong>
              <span>{{ formatDate(request.submitted_at) }}</span>
            </div>
            <div v-if="request.expected_execution_date" class="info-item">
              <strong>{{ $t('requestHistory.expectedExecutionDate') }}</strong>
              <span>{{ formatDate(request.expected_execution_date) }}</span>
            </div>
            <div class="info-item info-full">
              <strong>{{ $t('requestHistory.description') }}</strong>
              <p class="description">{{ request.description }}</p>
            </div>
          </div>
        </BaseCard>

        <!-- Attachments -->
        <BaseCard v-if="request.attachments && request.attachments.length > 0" class="section-card">
          <h2 class="section-title">{{ $t('requestHistory.attachments') }}</h2>
          <div class="attachments-list">
            <div v-for="attachment in request.attachments" :key="attachment.id" class="attachment-item">
              <div class="attachment-info">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                </svg>
                <span class="attachment-name">{{ attachment.file_name }}</span>
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
          <h2 class="section-title">{{ $t('requestHistory.collaboratingEmployees') }} ({{ request.employees.length }})</h2>
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
          <h2 class="section-title">{{ $t('requestHistory.departmentAEvaluations') }}</h2>
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
          <h2 class="section-title">{{ $t('requestHistory.pathEvaluations') }}</h2>
          <div class="path-evaluations-list">
            <div v-for="pathEval in request.path_evaluations" :key="pathEval.id" class="path-eval-item">
              <div class="path-eval-question">
                <strong>{{ pathEval.question?.question }}</strong>
              </div>
              <div class="path-eval-answer">
                <BaseBadge :variant="pathEval.is_applied ? 'success' : 'error'">
                  {{ pathEval.is_applied ? $t('evaluations.applied') : $t('evaluations.notApplied') }}
                </BaseBadge>
              </div>
              <div v-if="pathEval.notes" class="path-eval-notes">
                <strong>{{ $t('evaluations.notes') }}:</strong> {{ pathEval.notes }}
              </div>
              <div class="path-eval-meta">
                {{ $t('evaluations.evaluatedBy') }} {{ pathEval.evaluated_by?.name }} {{ $t('evaluations.evaluatedOn') }} {{ formatDate(pathEval.created_at) }}
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Transition History -->
        <BaseCard class="section-card">
          <h2 class="section-title">{{ $t('requestHistory.transitionHistory') }}</h2>
          <div class="timeline">
            <div v-for="(transition, index) in request.transitions" :key="transition.id" class="timeline-item">
              <div class="timeline-marker">{{ request.transitions.length - index }}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <BaseBadge variant="info">
                    {{ $t('workflow.actions.' + transition.action) }}
                  </BaseBadge>
                  <span class="timeline-date">{{ formatDate(transition.created_at) }}</span>
                </div>
                <div class="timeline-body">
                  <div class="timeline-info">
                    <strong>{{ $t('transitions.by') }}:</strong> {{ transition.actioned_by?.name }}
                  </div>
                  <div v-if="transition.from_status || transition.to_status" class="timeline-info">
                    <strong>{{ $t('transitions.statusChange') }}:</strong>
                    <span class="status-change">
                      <span v-if="transition.from_status">{{ $t('status.' + transition.from_status) }}</span>
                      <span v-if="transition.from_status && transition.to_status"> → </span>
                      <span v-if="transition.to_status">{{ $t('status.' + transition.to_status) }}</span>
                    </span>
                  </div>
                  <div v-if="transition.from_department || transition.to_department" class="timeline-info">
                    <strong>{{ $t('transitions.department') }}:</strong>
                    <span class="status-change">
                      <span v-if="transition.from_department">{{ transition.from_department.name }}</span>
                      <span v-if="transition.from_department && transition.to_department"> → </span>
                      <span v-if="transition.to_department">{{ transition.to_department.name }}</span>
                    </span>
                  </div>
                  <div v-if="transition.to_user" class="timeline-info">
                    <strong>{{ $t('requestHistory.assignedTo') }}:</strong> {{ transition.to_user.name }}
                  </div>
                  <div v-if="transition.comments" class="timeline-comments">
                    <strong>{{ $t('transitions.comments') }}:</strong> {{ transition.comments }}
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
    const response = await axios.get(`${API_URL}/workflow/requests/${requestId}/detail`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    request.value = response.data.request
  } catch (err) {
    error.value = err.response?.data?.message || t('requestHistory.failedToLoad')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/department-a-requests')
}

const getStatusVariant = (status) => {
  const variants = {
    draft: 'gray',
    pending: 'warning',
    in_review: 'info',
    in_progress: 'primary',
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
.request-history {
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
}

.page-header h1 {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin: 0;
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
  color: var(--color-primary-600);
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
.evaluations-list,
.path-evaluations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.evaluation-item,
.path-eval-item {
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.evaluation-question,
.path-eval-question {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-3);
}

.evaluation-answer,
.path-eval-answer {
  margin-bottom: var(--spacing-3);
}

.evaluation-notes,
.path-eval-notes {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-2);
}

.evaluation-meta,
.path-eval-meta {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-2);
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .employees-list {
    grid-template-columns: 1fr;
  }
}
</style>
