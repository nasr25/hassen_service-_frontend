<template>
  <AppLayout>
    <div class="department-workflow">
      <!-- Page Header -->
      <div class="page-header">
        <BaseButton variant="secondary" @click="goBack">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          {{ $t('common.back') }}
        </BaseButton>
        <div class="header-content">
          <h1>{{ $t('nav.departmentWorkflow') }}</h1>
          <p>{{ $t('dashboard.departmentWorkflow.description') }}</p>
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

      <!-- Success Alert -->
      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('department.loading') }}</p>
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="requests.length === 0" class="empty-state-card">
        <div class="empty-state">
          <svg width="96" height="96" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          <h2>{{ $t('department.noRequestsAssigned') }}</h2>
        </div>
      </BaseCard>

      <!-- Requests List -->
      <div v-else class="requests-grid">
        <BaseCard v-for="request in requests" :key="request.id" class="request-card">
          <div class="request-header">
            <h3>{{ request.title }}</h3>
            <BaseBadge :variant="getStatusVariant(request.status)">
              {{ $t('status.' + request.status) }}
            </BaseBadge>
          </div>

          <div class="request-body">
            <p class="description">{{ request.description }}</p>

            <div class="request-meta">
              <div class="meta-item">
                <strong>{{ $t('department.submittedBy') }}:</strong>
                <span>{{ request.user?.name }}</span>
              </div>
              <div class="meta-item">
                <strong>{{ $t('request.department') }}:</strong>
                <span>{{ request.current_department?.name }}</span>
              </div>
              <div class="meta-item">
                <strong>{{ $t('department.workflowPath') }}:</strong>
                <span>{{ request.workflow_path?.name }}</span>
              </div>
              <div v-if="request.current_assignee" class="meta-item">
                <strong>{{ $t('department.assignedTo') }}:</strong>
                <span>{{ request.current_assignee?.name }}</span>
              </div>
              <div class="meta-item">
                <strong>{{ $t('department.lastUpdated') }}:</strong>
                <span>{{ formatDate(request.updated_at) }}</span>
              </div>
              <div v-if="request.expected_execution_date" class="meta-item expected-date-item">
                <strong>{{ $t('department.expectedExecution') }}:</strong>
                <span>{{ formatDate(request.expected_execution_date) }}</span>
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

            <!-- Evaluation Results -->
            <div v-if="request.path_evaluations && request.path_evaluations.length > 0" class="evaluation-section">
              <div class="evaluation-header" @click="toggleEvaluation(request.id)">
                <div class="evaluation-header-content">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ $t('department.evaluationResults') }}</span>
                  <BaseBadge variant="success" size="sm">{{ request.path_evaluations.length }} {{ $t('department.evaluationsCompleted') }}</BaseBadge>
                </div>
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  :class="['expand-icon', { expanded: expandedEvaluations[request.id] }]"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>

              <div v-if="expandedEvaluations[request.id]" class="evaluation-results-list">
                <div v-for="(evaluation, index) in request.path_evaluations" :key="evaluation.id" class="evaluation-result-item">
                  <div class="evaluation-question">
                    <span class="question-number">{{ index + 1 }}</span>
                    <span class="question-text">{{ evaluation.question?.question }}</span>
                  </div>
                  <div class="evaluation-answer">
                    <BaseBadge :variant="evaluation.is_applied ? 'success' : 'danger'" size="sm">
                      {{ evaluation.is_applied ? $t('department.applied') : $t('department.notApplied') }}
                    </BaseBadge>
                  </div>
                  <div v-if="evaluation.notes" class="evaluation-notes">
                    <strong>{{ $t('department.notes') }}:</strong>
                    <p>{{ evaluation.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="request-actions">
            <!-- Manager Actions (only for unassigned requests) -->
            <template v-if="isManager && !request.current_user_id">
              <!-- Show Evaluate button if evaluation is required but not completed -->
              <template v-if="request.requires_evaluation && !request.has_evaluated">
                <BaseButton variant="primary" @click="openPathEvaluationModal(request, null)">
                  {{ $t('department.evaluateRequest') }}
                </BaseButton>
                <div class="evaluation-required-message">
                  {{ $t('department.evaluationRequiredMessage') }}
                </div>
              </template>

              <!-- Show action buttons only after evaluation is complete or not required -->
              <template v-else>
                <!-- If was previously assigned to employee and returned, show Return to Employee -->
                <BaseButton
                  v-if="request.was_assigned_to_employee && request.last_assigned_user_id"
                  variant="primary"
                  @click="returnToEmployee(request)"
                >
                  {{ $t('department.returnToEmployee') }}
                </BaseButton>
                <!-- Otherwise show Accept Idea -->
                <BaseButton
                  v-else
                  variant="success"
                  @click="openPathEvaluationModal(request, 'accept')"
                >
                  {{ $t('department.acceptIdea') }}
                </BaseButton>

                <BaseButton variant="warning" @click="openPathEvaluationModal(request, 'accept_later')">
                  {{ $t('department.acceptForLater') }}
                </BaseButton>
                <BaseButton variant="danger" @click="openPathEvaluationModal(request, 'reject')">
                  {{ $t('department.rejectIdea') }}
                </BaseButton>
                <BaseButton variant="info" @click="openPathEvaluationModal(request, 'return')">
                  {{ $t('common.back') }} {{ $t('common.to') }} {{ getDepartmentAName(request) }}
                </BaseButton>
              </template>
            </template>

            <!-- Employee: Return to Manager -->
            <BaseButton
              v-if="isEmployee(request) && request.current_user_id === authStore.user?.id"
              variant="warning"
              @click="openReturnToManagerModal(request)"
            >
              {{ $t('department.returnToManager') }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Assign to Employee Modal -->
    <div v-if="assignModal.show" class="modal-overlay" @click="closeAssignModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('department.assignToEmployee') }}</h2>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ assignModal.request?.title }}</p>

        <div class="form-group">
          <label>{{ $t('department.selectEmployee') }} *</label>
          <div class="employees-list">
            <div
              v-for="employee in employees"
              :key="employee.id"
              :class="['employee-option', { selected: assignModal.employeeId === employee.id }]"
              @click="assignModal.employeeId = employee.id"
            >
              <strong>{{ employee.name }}</strong>
              <span class="employee-email">{{ employee.email }}</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('department.commentsOptional') }}</label>
          <textarea
            v-model="assignModal.comments"
            :placeholder="$t('department.addInstructions')"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeAssignModal">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmAssign"
            :disabled="!assignModal.employeeId || assignModal.isLoading"
          >
            {{ assignModal.isLoading ? $t('department.assigning') : $t('department.assignToEmployee') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Return to Manager Modal (Employee) -->
    <div v-if="returnToManagerModal.show" class="modal-overlay" @click="closeReturnToManagerModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('department.returnToManager') }}</h2>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ returnToManagerModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>{{ $t('evaluations.notes') }}:</strong> {{ $t('department.returnRequestNote') }}
        </div>

        <div class="form-group">
          <label>{{ $t('department.workSummary') }} *</label>
          <textarea
            v-model="returnToManagerModal.comments"
            :placeholder="$t('department.describeWork')"
            rows="5"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeReturnToManagerModal">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmReturnToManager"
            :disabled="!returnToManagerModal.comments || returnToManagerModal.isLoading"
          >
            {{ returnToManagerModal.isLoading ? $t('department.returning') : $t('department.returnToManager') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Path Evaluation Modal (Manager) -->
    <div v-if="pathEvaluationModal.show" class="modal-overlay" @click="closePathEvaluationModal">
      <div class="modal-content evaluation-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ $t('department.pathEvaluationRequired') }}</h2>
          <button @click="closePathEvaluationModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ pathEvaluationModal.request?.title }}</p>

        <div v-if="pathEvaluationModal.action" class="alert alert-info">
          <strong>{{ $t('department.action') }}:</strong>
          <span v-if="pathEvaluationModal.action === 'accept'">{{ $t('department.acceptIdeaAction') }}</span>
          <span v-else-if="pathEvaluationModal.action === 'accept_later'">{{ $t('department.acceptLaterAction') }}</span>
          <span v-else-if="pathEvaluationModal.action === 'reject'">{{ $t('department.rejectIdeaAction') }}</span>
          <span v-else-if="pathEvaluationModal.action === 'return'">{{ $t('common.back') }} {{ $t('common.to') }} {{ getDepartmentAName(pathEvaluationModal.request) }} {{ $t('department.forValidation') }}</span>
        </div>

        <div v-if="pathEvaluationModal.isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ $t('department.loadingQuestions') }}</p>
        </div>

        <div v-else-if="pathEvaluationModal.questions.length === 0" class="alert alert-warning">
          {{ $t('department.noQuestions') }} {{ $t('department.canProceed') }}
        </div>

        <div v-else class="evaluation-form">
          <div v-for="(question, index) in pathEvaluationModal.questions" :key="question.id" class="evaluation-question">
            <div class="question-header">
              <BaseBadge variant="primary">Q{{ index + 1 }}</BaseBadge>
              <BaseBadge variant="gray">{{ $t('department.applied') }} / {{ $t('department.notApplied') }}</BaseBadge>
            </div>
            <p class="question-text">{{ question.question }}</p>

            <div class="answer-section">
              <label>{{ $t('department.answer') }} *</label>
              <div class="toggle-buttons">
                <button
                  type="button"
                  :class="['toggle-btn', 'toggle-applied', { active: pathEvaluationModal.evaluations[question.id]?.is_applied === true }]"
                  @click="setEvaluation(question.id, true)"
                >
                  ✓ {{ $t('department.applied') }}
                </button>
                <button
                  type="button"
                  :class="['toggle-btn', 'toggle-not-applied', { active: pathEvaluationModal.evaluations[question.id]?.is_applied === false }]"
                  @click="setEvaluation(question.id, false)"
                >
                  ✗ {{ $t('department.notApplied') }}
                </button>
              </div>
            </div>

            <div class="notes-section">
              <label>{{ $t('department.notes') }} ({{ $t('common.optional') }})</label>
              <textarea
                v-model="pathEvaluationModal.evaluations[question.id].notes"
                :placeholder="$t('department.addComments')"
                rows="2"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div class="evaluation-summary">
            <strong>{{ $t('department.progress') }}:</strong> {{ answeredPathQuestionsCount }} / {{ pathEvaluationModal.questions.length }} {{ $t('department.questionsAnswered') }}
          </div>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closePathEvaluationModal">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            v-if="pathEvaluationModal.questions.length === 0"
            variant="primary"
            @click="proceedWithAction"
          >
            {{ getActionButtonText() }}
          </BaseButton>
          <BaseButton
            v-else
            variant="primary"
            @click="submitPathEvaluation"
            :disabled="!isEvaluationComplete || pathEvaluationModal.isSaving"
            :loading="pathEvaluationModal.isSaving"
          >
            {{ $t('department.submitAndContinue') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Return to Department A Modal (Manager) -->
    <div v-if="returnToDeptAModal.show" class="modal-overlay" @click="closeReturnToDeptAModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('common.back') }} {{ $t('common.to') }} {{ getDepartmentAName(returnToDeptAModal.request) }}</h2>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ returnToDeptAModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>{{ $t('evaluations.notes') }}:</strong> {{ $t('department.requestWillBeReturnedTo') }} {{ getDepartmentAName(returnToDeptAModal.request) }} {{ $t('department.forFinalValidation') }}.
        </div>

        <div class="form-group">
          <label>{{ $t('department.validationSummary') }} *</label>
          <textarea
            v-model="returnToDeptAModal.comments"
            :placeholder="$t('department.confirmWork')"
            rows="5"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeReturnToDeptAModal">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmReturnToDeptA"
            :disabled="!returnToDeptAModal.comments || returnToDeptAModal.isLoading"
          >
            {{ returnToDeptAModal.isLoading ? $t('department.returning') : $t('common.back') + ' ' + $t('common.to') + ' ' + getDepartmentAName(returnToDeptAModal.request) }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Accept for Later Modal (Manager) -->
    <div v-if="acceptLaterModal.show" class="modal-overlay" @click="closeAcceptLaterModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('department.acceptForLater') }}</h2>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ acceptLaterModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>{{ $t('evaluations.notes') }}:</strong> {{ $t('department.acceptLaterNote') }}
        </div>

        <div class="form-group">
          <label>{{ $t('department.expectedDate') }} *</label>
          <input
            type="date"
            v-model="acceptLaterModal.expectedDate"
            class="date-input"
            :min="new Date().toISOString().split('T')[0]"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ $t('department.commentsOptional') }}</label>
          <textarea
            v-model="acceptLaterModal.comments"
            :placeholder="$t('department.scheduleReason')"
            rows="4"
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeAcceptLaterModal">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmAcceptLater"
            :disabled="!acceptLaterModal.expectedDate || acceptLaterModal.isLoading"
          >
            {{ acceptLaterModal.isLoading ? $t('department.accepting') : $t('department.acceptForLater') }}
          </BaseButton>
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
import { API_URL, BASE_URL } from '../config/api'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const requests = ref([])
const employees = ref([])
const departmentA = ref(null)
const error = ref(null)
const success = ref(null)
const isLoading = ref(true)
const expandedEvaluations = ref({})

const assignModal = ref({
  show: false,
  request: null,
  employeeId: null,
  comments: '',
  isLoading: false
})

const returnToManagerModal = ref({
  show: false,
  request: null,
  comments: '',
  isLoading: false
})

const returnToDeptAModal = ref({
  show: false,
  request: null,
  comments: '',
  isLoading: false
})

const acceptLaterModal = ref({
  show: false,
  request: null,
  expectedDate: '',
  comments: '',
  isLoading: false
})

const pathEvaluationModal = ref({
  show: false,
  request: null,
  action: null, // 'accept', 'accept_later', 'reject', 'return'
  questions: [],
  evaluations: {},
  isLoading: false,
  isSaving: false
})

const isManager = computed(() => authStore.user?.role === 'manager')

const isEmployee = (request) => {
  // Check if user is an employee (not manager) in the department
  return authStore.user?.role === 'employee' && request.current_user_id === authStore.user?.id
}

// Get Department A name
const getDepartmentAName = (request) => {
  return departmentA.value?.name || 'Department A'
}

onMounted(async () => {
  await Promise.all([
    loadRequests(),
    loadDepartmentA(),
    isManager.value ? loadEmployees() : Promise.resolve()
  ])
})

const loadRequests = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await axios.get(`${API_URL}/department/requests`, {
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

const loadEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/department/employees`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    employees.value = response.data.employees
  } catch (err) {
    console.error('Failed to load employees:', err)
  }
}

const loadDepartmentA = async () => {
  try {
    const response = await axios.get(`${API_URL}/departments`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    // Find the department marked as Department A
    departmentA.value = response.data.departments.find(dept => dept.is_department_a === true)
  } catch (err) {
    console.error('Failed to load Department A:', err)
  }
}

const goBack = () => {
  router.push('/dashboard')
}

const toggleEvaluation = (requestId) => {
  expandedEvaluations.value[requestId] = !expandedEvaluations.value[requestId]
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
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Assign to Employee Modal
const openAssignModal = (request) => {
  assignModal.value.show = true
  assignModal.value.request = request
  assignModal.value.employeeId = null
  assignModal.value.comments = ''
}

const closeAssignModal = () => {
  assignModal.value.show = false
  assignModal.value.request = null
  assignModal.value.employeeId = null
  assignModal.value.comments = ''
}

const confirmAssign = async () => {
  try {
    assignModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/department/requests/${assignModal.value.request.id}/assign-employee`,
      {
        employee_id: assignModal.value.employeeId,
        comments: assignModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Close modal immediately after success
    closeAssignModal()

    success.value = t('messages.success.requestAssigned')

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch(err => {
      console.error('Failed to reload requests:', err)
    })

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToAssign')
    assignModal.value.isLoading = false
  }
}

// Return request to the previously assigned employee
const returnToEmployee = async (request) => {
  if (!request.last_assigned_user_id) {
    error.value = t('messages.error.noPreviousEmployee')
    return
  }

  try {
    error.value = null

    await axios.post(
      `${API_URL}/department/requests/${request.id}/assign-employee`,
      {
        employee_id: request.last_assigned_user_id,
        comments: t('department.returnedToEmployee')
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = t('messages.success.requestReturnedToEmployee')

    // Reload requests (don't await to prevent blocking)
    loadRequests().catch(err => {
      console.error('Failed to reload requests:', err)
    })

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToAssign')
  }
}

// Return to Manager Modal (Employee)
const openReturnToManagerModal = (request) => {
  returnToManagerModal.value.show = true
  returnToManagerModal.value.request = request
  returnToManagerModal.value.comments = ''
}

const closeReturnToManagerModal = () => {
  returnToManagerModal.value.show = false
  returnToManagerModal.value.request = null
  returnToManagerModal.value.comments = ''
}

const confirmReturnToManager = async () => {
  try {
    returnToManagerModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/department/requests/${returnToManagerModal.value.request.id}/return-to-manager`,
      {
        comments: returnToManagerModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Close modal immediately after success
    closeReturnToManagerModal()

    success.value = t('messages.success.requestReturned')

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch(err => {
      console.error('Failed to reload requests:', err)
    })

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToReturn')
    returnToManagerModal.value.isLoading = false
  }
}

// Return to Department A Modal (Manager)
const openReturnToDeptAModal = (request) => {
  returnToDeptAModal.value.show = true
  returnToDeptAModal.value.request = request
  returnToDeptAModal.value.comments = ''
}

const closeReturnToDeptAModal = () => {
  returnToDeptAModal.value.show = false
  returnToDeptAModal.value.request = null
  returnToDeptAModal.value.comments = ''
}

const confirmReturnToDeptA = async () => {
  try {
    returnToDeptAModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/department/requests/${returnToDeptAModal.value.request.id}/return-to-dept-a`,
      {
        comments: returnToDeptAModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Close modal immediately after success
    closeReturnToDeptAModal()

    success.value = t('messages.success.requestReturnedDeptA')

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch(err => {
      console.error('Failed to reload requests:', err)
    })

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToReturn')
    returnToDeptAModal.value.isLoading = false
  }
}

// Path Evaluation Modal
const isEvaluationComplete = computed(() => {
  if (pathEvaluationModal.value.questions.length === 0) return true

  return pathEvaluationModal.value.questions.every(q => {
    const evaluation = pathEvaluationModal.value.evaluations[q.id]
    return evaluation && evaluation.is_applied !== undefined && evaluation.is_applied !== null
  })
})

const answeredPathQuestionsCount = computed(() => {
  if (pathEvaluationModal.value.questions.length === 0) return 0

  return pathEvaluationModal.value.questions.filter(q => {
    const evaluation = pathEvaluationModal.value.evaluations[q.id]
    return evaluation && evaluation.is_applied !== undefined && evaluation.is_applied !== null
  }).length
})

const openPathEvaluationModal = async (request, action) => {
  // If request is already evaluated and an action is specified, skip modal and proceed directly
  if (request.has_evaluated && action) {
    pathEvaluationModal.value.request = request
    pathEvaluationModal.value.action = action
    proceedWithAction()
    return
  }

  pathEvaluationModal.value.show = true
  pathEvaluationModal.value.request = request
  pathEvaluationModal.value.action = action
  pathEvaluationModal.value.questions = []
  pathEvaluationModal.value.evaluations = {}
  pathEvaluationModal.value.isLoading = true

  try {
    const response = await axios.get(
      `${API_URL}/department/requests/${request.id}/path-evaluation-questions`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    pathEvaluationModal.value.questions = response.data.questions

    // Initialize evaluations object
    response.data.questions.forEach(q => {
      pathEvaluationModal.value.evaluations[q.id] = {
        is_applied: null,
        notes: ''
      }
    })

    // Load existing evaluations if any
    if (response.data.evaluations) {
      Object.values(response.data.evaluations).forEach(evaluation => {
        if (pathEvaluationModal.value.evaluations[evaluation.path_evaluation_question_id]) {
          pathEvaluationModal.value.evaluations[evaluation.path_evaluation_question_id] = {
            is_applied: evaluation.is_applied,
            notes: evaluation.notes || ''
          }
        }
      })
    }
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToLoadQuestions')
    closePathEvaluationModal()
  } finally {
    pathEvaluationModal.value.isLoading = false
  }
}

const closePathEvaluationModal = () => {
  pathEvaluationModal.value.show = false
  pathEvaluationModal.value.request = null
  pathEvaluationModal.value.questions = []
  pathEvaluationModal.value.evaluations = {}
}

const setEvaluation = (questionId, isApplied) => {
  if (!pathEvaluationModal.value.evaluations[questionId]) {
    pathEvaluationModal.value.evaluations[questionId] = { notes: '' }
  }
  pathEvaluationModal.value.evaluations[questionId].is_applied = isApplied
}

const submitPathEvaluation = async () => {
  try {
    pathEvaluationModal.value.isSaving = true
    error.value = null

    // Transform evaluations object to array format expected by API
    const evaluationsArray = pathEvaluationModal.value.questions.map(q => ({
      question_id: q.id,
      is_applied: pathEvaluationModal.value.evaluations[q.id].is_applied,
      notes: pathEvaluationModal.value.evaluations[q.id].notes || null
    }))

    await axios.post(
      `${API_URL}/department/requests/${pathEvaluationModal.value.request.id}/path-evaluation`,
      {
        evaluations: evaluationsArray
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Close modal immediately after successful submission
    closePathEvaluationModal()

    success.value = t('messages.success.evaluationSubmitted')
    setTimeout(() => (success.value = null), 3000)

    // If there's an action, proceed with it, otherwise just reload
    if (pathEvaluationModal.value.action) {
      const request = pathEvaluationModal.value.request
      const action = pathEvaluationModal.value.action

      // Small delay to ensure modal closes before opening next modal
      setTimeout(() => {
        switch (action) {
          case 'accept':
            openAssignModal(request)
            break
          case 'accept_later':
            openAcceptLaterModal(request)
            break
          case 'reject':
            rejectIdea(request)
            break
          case 'return':
            openReturnToDeptAModal(request)
            break
        }
      }, 100)
    } else {
      // Reload requests (don't await to prevent blocking)
      loadRequests().catch(err => {
        console.error('Failed to reload requests:', err)
      })
    }
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToSubmitEvaluation')
  } finally {
    pathEvaluationModal.value.isSaving = false
  }
}

const getActionButtonText = () => {
  switch (pathEvaluationModal.value.action) {
    case 'accept':
      return t('department.proceedToAssign')
    case 'accept_later':
      return t('department.acceptForLater')
    case 'reject':
      return t('department.rejectIdea')
    case 'return':
      return t('common.back') + ' ' + t('common.to') + ' ' + getDepartmentAName(pathEvaluationModal.value.request)
    default:
      return t('common.continue')
  }
}

const proceedWithAction = () => {
  const request = pathEvaluationModal.value.request
  const action = pathEvaluationModal.value.action
  closePathEvaluationModal()

  switch (action) {
    case 'accept':
      openAssignModal(request)
      break
    case 'accept_later':
      openAcceptLaterModal(request)
      break
    case 'reject':
      rejectIdea(request)
      break
    case 'return':
      openReturnToDeptAModal(request)
      break
  }
}

// Accept for Later Modal
const openAcceptLaterModal = (request) => {
  acceptLaterModal.value.show = true
  acceptLaterModal.value.request = request
  acceptLaterModal.value.expectedDate = ''
  acceptLaterModal.value.comments = ''
}

const closeAcceptLaterModal = () => {
  acceptLaterModal.value.show = false
  acceptLaterModal.value.request = null
  acceptLaterModal.value.expectedDate = ''
  acceptLaterModal.value.comments = ''
}

const confirmAcceptLater = async () => {
  try {
    acceptLaterModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/department/requests/${acceptLaterModal.value.request.id}/accept-later`,
      {
        expected_execution_date: acceptLaterModal.value.expectedDate,
        comments: acceptLaterModal.value.comments || 'Idea accepted for future implementation'
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    // Close modal immediately after success
    closeAcceptLaterModal()

    success.value = t('messages.success.ideaAccepted')

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch(err => {
      console.error('Failed to reload requests:', err)
    })

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToAccept')
    acceptLaterModal.value.isLoading = false
  }
}

const rejectIdea = async (request) => {
  const reason = prompt(`${t('department.rejectPrompt')}\n\n${t('request.request')}: ${request.title}\n\n${t('department.provideReason')}`)
  if (!reason) return

  try {
    error.value = null
    await axios.post(
      `${API_URL}/department/requests/${request.id}/reject`,
      { comments: reason },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = t('messages.success.ideaRejected')

    // Reload requests (don't await to prevent blocking)
    loadRequests().catch(err => {
      console.error('Failed to reload requests:', err)
    })

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToReject')
  }
}
</script>

<style scoped>
.department-workflow {
  max-width: 1400px;
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

.header-content {
  flex: 1;
  text-align: center;
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.header-content p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
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

.alert-success {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border: 1px solid var(--color-success-200);
}

.alert-info {
  background: var(--color-info-50);
  color: var(--color-info-700);
  border: 1px solid var(--color-info-200);
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
  margin: 0;
}

/* Requests Grid */
.requests-grid {
  display: grid;
  gap: var(--spacing-6);
}

.request-card {
  transition: all var(--transition-base);
}

.request-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.request-header h3 {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.request-body {
  margin-bottom: var(--spacing-6);
}

.description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin-bottom: var(--spacing-4);
}

.request-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.meta-item strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.meta-item span {
  color: var(--color-text-secondary);
}

.meta-item.expected-date-item {
  background: var(--color-warning-50);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-warning-200);
}

.meta-item.expected-date-item strong {
  color: var(--color-warning-700);
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
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
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

.attachment-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Evaluation Section */
.evaluation-section {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.evaluation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.evaluation-header:hover {
  background: var(--color-success-100);
}

.evaluation-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success-700);
}

.expand-icon {
  color: var(--color-success-700);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.evaluation-results-list {
  margin-top: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.evaluation-result-item {
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.evaluation-question {
  align-items: flex-start;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.question-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: var(--color-primary-500);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.evaluation-answer {
  margin-bottom: var(--spacing-3);
}

.evaluation-notes {
  padding: var(--spacing-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.evaluation-notes strong {
  display: block;
  margin-bottom: var(--spacing-1);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.evaluation-notes p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Request Actions */
.request-actions {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.request-actions > * {
  flex: 1;
  min-width: 160px;
}

.evaluation-required-message {
  width: 100%;
  padding: var(--spacing-3);
  background: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: var(--radius-md);
  color: var(--color-info-700);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-top: var(--spacing-2);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.evaluation-modal {
  max-width: 800px;
}

.modal-content h2 {
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2);
}

.modal-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-6);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.form-group textarea,
.form-group .date-input {
  width: 100%;
  padding: var(--spacing-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.form-group textarea:focus,
.form-group .date-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 300px;
  overflow-y: auto;
}

.employee-option {
  padding: var(--spacing-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.employee-option:hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.employee-option.selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-100);
}

.employee-option strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  display: block;
  margin-bottom: var(--spacing-1);
}

.employee-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);
}

.modal-actions > * {
  flex: 1;
}

/* Path Evaluation Modal */
.path-evaluation-modal {
  max-width: 800px;
}

.evaluation-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: var(--spacing-2);
}

.evaluation-question {
  background: var(--color-surface);
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-4);
  border-left: 4px solid var(--color-primary-500);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  gap: var(--spacing-2);
}

.question-text {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-relaxed);
  margin: 0 0 var(--spacing-4) 0;
}

.answer-section {
  margin-bottom: var(--spacing-4);
}

.answer-section label {
  display: block;
  margin-bottom: var(--spacing-3);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.toggle-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.toggle-btn {
  flex: 1;
  padding: var(--spacing-4);
  border: 2px solid var(--color-border);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toggle-applied {
  color: var(--color-success-700);
  border-color: var(--color-success-200);
}

.toggle-applied:hover {
  background: var(--color-success-50);
  border-color: var(--color-success-300);
}

.toggle-applied.active {
  background: var(--color-success-600);
  color: white;
  border-color: var(--color-success-600);
  transform: scale(1.05);
}

.toggle-not-applied {
  color: var(--color-error-700);
  border-color: var(--color-error-200);
}

.toggle-not-applied:hover {
  background: var(--color-error-50);
  border-color: var(--color-error-300);
}

.toggle-not-applied.active {
  background: var(--color-error-600);
  color: white;
  border-color: var(--color-error-600);
  transform: scale(1.05);
}

.notes-section {
  margin-top: var(--spacing-4);
}

.notes-section label {
  display: block;
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.form-textarea {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  resize: vertical;
  transition: all var(--transition-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.evaluation-summary {
  background: var(--color-success-50);
  color: var(--color-success-700);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  text-align: center;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-4);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-content {
    text-align: left;
  }

  .request-meta {
    grid-template-columns: 1fr;
  }

  .request-actions {
    flex-direction: column;
  }

  .request-actions > * {
    min-width: unset;
  }
}
</style>
