<template>
  <div class="page-container">
    <div class="page-card">
      <div class="header">
        <button @click="goBack" class="btn-back">{{ $t('common.back') }}</button>
        <h1>{{ $t('nav.departmentWorkflow') }}</h1>
        <button @click="loadRequests" class="btn-refresh">{{ $t('common.refresh') }}</button>
      </div>

      <p class="subtitle">{{ $t('dashboard.departmentWorkflow.description') }}</p>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <div v-if="isLoading" class="loading">
        Loading department requests...
      </div>

      <div v-else-if="requests.length === 0" class="empty-state">
        <p>No requests assigned to your department.</p>
      </div>

      <div v-else class="requests-grid">
        <div v-for="request in requests" :key="request.id" class="request-card">
          <div class="request-header">
            <h3>{{ request.title }}</h3>
            <span :class="['badge', `badge-${request.status}`]">
              {{ formatStatus(request.status) }}
            </span>
          </div>

          <div class="request-body">
            <p class="description">{{ request.description }}</p>

            <div class="request-meta">
              <div class="meta-item">
                <strong>Submitted by:</strong> {{ request.user?.name }}
              </div>
              <div class="meta-item">
                <strong>Department:</strong> {{ request.current_department?.name }}
              </div>
              <div class="meta-item">
                <strong>Workflow Path:</strong> {{ request.workflow_path?.name }}
              </div>
              <div v-if="request.current_assignee" class="meta-item">
                <strong>Assigned to:</strong> {{ request.current_assignee?.name }}
              </div>
              <div class="meta-item">
                <strong>Last Updated:</strong> {{ formatDate(request.updated_at) }}
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
                   :href="`http://localhost:8000/storage/${attachment.file_path}`"
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
          </div>

          <div class="request-actions">
            <!-- Manager Actions (only for unassigned requests) -->
            <template v-if="isManager && !request.current_user_id">
              <button @click="openPathEvaluationModal(request, 'accept')" class="btn-action btn-accept">
                ✓ Accept Idea
              </button>
              <button @click="openPathEvaluationModal(request, 'accept_later')" class="btn-action btn-accept-later">
                ⏰ Accept for Later
              </button>
              <button @click="openPathEvaluationModal(request, 'reject')" class="btn-action btn-reject">
                ✗ Reject Idea
              </button>
              <button @click="openPathEvaluationModal(request, 'return')" class="btn-action btn-return">
                ↩️ Return to Dept A
              </button>
            </template>

            <!-- Employee: Return to Manager -->
            <button
              v-if="isEmployee(request) && request.current_user_id === authStore.user?.id"
              @click="openReturnToManagerModal(request)"
              class="btn-action btn-return-manager"
            >
              ↩️ Return to Manager
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign to Employee Modal -->
    <div v-if="assignModal.show" class="modal-overlay" @click="closeAssignModal">
      <div class="modal-content" @click.stop>
        <h2>Assign to Employee</h2>
        <p class="modal-subtitle">Request: {{ assignModal.request?.title }}</p>

        <div class="form-group">
          <label>Select Employee *</label>
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
          <label>Comments (Optional)</label>
          <textarea
            v-model="assignModal.comments"
            placeholder="Add any instructions for the employee..."
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeAssignModal" class="btn-secondary">Cancel</button>
          <button
            @click="confirmAssign"
            :disabled="!assignModal.employeeId || assignModal.isLoading"
            class="btn-primary"
          >
            {{ assignModal.isLoading ? 'Assigning...' : 'Assign to Employee' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Return to Manager Modal (Employee) -->
    <div v-if="returnToManagerModal.show" class="modal-overlay" @click="closeReturnToManagerModal">
      <div class="modal-content" @click.stop>
        <h2>Return to Manager</h2>
        <p class="modal-subtitle">Request: {{ returnToManagerModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>Note:</strong> This will return the request to your department manager for review.
        </div>

        <div class="form-group">
          <label>Work Summary / Comments *</label>
          <textarea
            v-model="returnToManagerModal.comments"
            placeholder="Describe the work completed and any findings..."
            rows="5"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeReturnToManagerModal" class="btn-secondary">Cancel</button>
          <button
            @click="confirmReturnToManager"
            :disabled="!returnToManagerModal.comments || returnToManagerModal.isLoading"
            class="btn-primary"
          >
            {{ returnToManagerModal.isLoading ? 'Returning...' : 'Return to Manager' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Path Evaluation Modal (Manager) -->
    <div v-if="pathEvaluationModal.show" class="modal-overlay" @click="closePathEvaluationModal">
      <div class="modal-content path-evaluation-modal" @click.stop>
        <h2>✅ Path Evaluation Required</h2>
        <p class="modal-subtitle">Request: {{ pathEvaluationModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>Action:</strong>
          <span v-if="pathEvaluationModal.action === 'accept'">Accept Idea - Assign to employee</span>
          <span v-else-if="pathEvaluationModal.action === 'accept_later'">Accept for Later - Schedule for future assignment</span>
          <span v-else-if="pathEvaluationModal.action === 'reject'">Reject Idea - Decline this request</span>
          <span v-else-if="pathEvaluationModal.action === 'return'">Return to Department A for validation</span>
        </div>

        <div class="alert alert-info">
          <strong>Note:</strong> Please evaluate this request before proceeding.
        </div>

        <div v-if="pathEvaluationModal.isLoading" class="loading">
          Loading evaluation questions...
        </div>

        <div v-else-if="pathEvaluationModal.questions.length === 0" class="alert alert-info">
          <strong>No evaluation questions configured for this workflow path.</strong>
          <p style="margin-top: 8px; font-size: 13px;">You can proceed directly to assign this request.</p>
        </div>

        <div v-else class="evaluation-questions-list">
          <div v-for="(question, index) in pathEvaluationModal.questions" :key="question.id" class="evaluation-question">
            <h4 class="question-title">
              <span class="question-number">Q{{ index + 1 }}</span>
              {{ question.question }}
            </h4>

            <div class="evaluation-toggles">
              <button
                :class="['toggle-btn', 'applied', { active: pathEvaluationModal.evaluations[question.id]?.is_applied === true }]"
                @click="setEvaluation(question.id, true)"
              >
                ✓ Applied
              </button>
              <button
                :class="['toggle-btn', 'not-applied', { active: pathEvaluationModal.evaluations[question.id]?.is_applied === false }]"
                @click="setEvaluation(question.id, false)"
              >
                ✗ Not Applied
              </button>
            </div>

            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea
                v-model="pathEvaluationModal.evaluations[question.id].notes"
                placeholder="Add any additional comments or context..."
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closePathEvaluationModal" class="btn-secondary">Cancel</button>
          <button
            v-if="pathEvaluationModal.questions.length === 0"
            @click="proceedWithAction"
            class="btn-primary"
          >
            {{ getActionButtonText() }}
          </button>
          <button
            v-else
            @click="submitPathEvaluation"
            :disabled="!isEvaluationComplete || pathEvaluationModal.isSaving"
            class="btn-primary"
          >
            {{ pathEvaluationModal.isSaving ? 'Saving...' : 'Save Evaluation & Continue' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Return to Department A Modal (Manager) -->
    <div v-if="returnToDeptAModal.show" class="modal-overlay" @click="closeReturnToDeptAModal">
      <div class="modal-content" @click.stop>
        <h2>Return to Department A</h2>
        <p class="modal-subtitle">Request: {{ returnToDeptAModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>Note:</strong> This will send the request back to Department A for final validation.
        </div>

        <div class="form-group">
          <label>Validation Summary / Comments *</label>
          <textarea
            v-model="returnToDeptAModal.comments"
            placeholder="Confirm work completion and provide validation notes..."
            rows="5"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeReturnToDeptAModal" class="btn-secondary">Cancel</button>
          <button
            @click="confirmReturnToDeptA"
            :disabled="!returnToDeptAModal.comments || returnToDeptAModal.isLoading"
            class="btn-primary"
          >
            {{ returnToDeptAModal.isLoading ? 'Returning...' : 'Return to Dept A' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Accept for Later Modal (Manager) -->
    <div v-if="acceptLaterModal.show" class="modal-overlay" @click="closeAcceptLaterModal">
      <div class="modal-content" @click.stop>
        <h2>⏰ Accept Idea for Later Implementation</h2>
        <p class="modal-subtitle">Request: {{ acceptLaterModal.request?.title }}</p>

        <div class="alert alert-info">
          <strong>Note:</strong> This idea will be accepted but scheduled for future implementation.
        </div>

        <div class="form-group">
          <label>Expected Execution Date *</label>
          <input
            type="date"
            v-model="acceptLaterModal.expectedDate"
            class="date-input"
            :min="new Date().toISOString().split('T')[0]"
            required
          />
        </div>

        <div class="form-group">
          <label>Comments (Optional)</label>
          <textarea
            v-model="acceptLaterModal.comments"
            placeholder="Add any notes about why this is scheduled for later..."
            rows="4"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeAcceptLaterModal" class="btn-secondary">Cancel</button>
          <button
            @click="confirmAcceptLater"
            :disabled="!acceptLaterModal.expectedDate || acceptLaterModal.isLoading"
            class="btn-primary"
          >
            {{ acceptLaterModal.isLoading ? 'Accepting...' : 'Accept for Later' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const requests = ref([])
const employees = ref([])
const error = ref(null)
const success = ref(null)
const isLoading = ref(true)

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

const API_URL = 'http://localhost:8000/api'

const isManager = computed(() => authStore.user?.role === 'manager')

const isEmployee = (request) => {
  // Check if user is an employee (not manager) in the department
  return authStore.user?.role === 'employee' && request.current_user_id === authStore.user?.id
}

onMounted(async () => {
  await loadRequests()
  if (isManager.value) {
    await loadEmployees()
  }
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
    error.value = err.response?.data?.message || 'Failed to load requests'
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

const goBack = () => {
  router.push('/dashboard')
}

const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

    success.value = 'Request assigned to employee successfully'
    closeAssignModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to assign to employee'
  } finally {
    assignModal.value.isLoading = false
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

    success.value = 'Request returned to manager successfully'
    closeReturnToManagerModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to return request'
  } finally {
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

    success.value = 'Request returned to Department A successfully'
    closeReturnToDeptAModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to return request'
  } finally {
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

const openPathEvaluationModal = async (request, action) => {
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
    error.value = err.response?.data?.message || 'Failed to load evaluation questions'
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

    success.value = 'Evaluation submitted successfully'
    setTimeout(() => (success.value = null), 3000)

    // Proceed with the selected action
    proceedWithAction()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit evaluation'
  } finally {
    pathEvaluationModal.value.isSaving = false
  }
}

const getActionButtonText = () => {
  switch (pathEvaluationModal.value.action) {
    case 'accept':
      return 'Proceed to Assign Employee'
    case 'accept_later':
      return 'Accept for Later'
    case 'reject':
      return 'Reject Idea'
    case 'return':
      return 'Return to Dept A'
    default:
      return 'Continue'
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

    success.value = 'Idea accepted for later implementation'
    closeAcceptLaterModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to accept idea'
  } finally {
    acceptLaterModal.value.isLoading = false
  }
}

const acceptIdeaForLater = async (request) => {
  // This function is now replaced by the modal flow
  openAcceptLaterModal(request)
}

const rejectIdea = async (request) => {
  const reason = prompt(`Reject this idea?\n\nRequest: ${request.title}\n\nPlease provide a reason for rejection:`)
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

    success.value = 'Idea rejected'
    await loadRequests()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reject idea'
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 15px;
}

.btn-back, .btn-refresh {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-back:hover, .btn-refresh:hover {
  background: #e0e0e0;
}

h1 {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.alert {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.alert-info {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #90caf9;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.requests-grid {
  display: grid;
  gap: 20px;
}

.request-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  background: white;
  transition: all 0.3s;
}

.request-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.request-header h3 {
  color: #333;
  font-size: 18px;
  margin: 0;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-in_review {
  background: #cfe2ff;
  color: #084298;
}

.request-body {
  margin-bottom: 20px;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.request-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
}

.meta-item {
  color: #666;
}

.meta-item strong {
  color: #333;
  display: block;
  margin-bottom: 2px;
}

.request-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  flex: 1;
  min-width: 160px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-accept {
  background: #4caf50;
  color: white;
}

.btn-accept:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-accept-later {
  background: #ff9800;
  color: white;
}

.btn-accept-later:hover {
  background: #f57c00;
  transform: translateY(-2px);
}

.btn-reject {
  background: #f44336;
  color: white;
}

.btn-reject:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

.btn-return {
  background: #2196f3;
  color: white;
}

.btn-return:hover {
  background: #0b7dda;
  transform: translateY(-2px);
}

.btn-return-manager {
  background: #ff9800;
  color: white;
}

.btn-return-manager:hover {
  background: #f57c00;
  transform: translateY(-2px);
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #333;
  margin-bottom: 10px;
}

.modal-subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group .date-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.3s;
  cursor: pointer;
}

.form-group .date-input:focus {
  outline: none;
  border-color: #667eea;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.employee-option {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.employee-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.employee-option.selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.employee-option strong {
  color: #333;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.employee-email {
  color: #999;
  font-size: 12px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Path Evaluation Modal Styles */
.path-evaluation-modal {
  max-width: 700px;
}

.evaluation-questions-list {
  margin-top: 20px;
}

.evaluation-question {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  border: 2px solid #e0e0e0;
}

.question-title {
  color: #333;
  font-size: 15px;
  margin: 0 0 15px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
}

.question-number {
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.evaluation-toggles {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.toggle-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-btn:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.toggle-btn.applied.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.toggle-btn.not-applied.active {
  background: #f44336;
  color: white;
  border-color: #f44336;
}

.toggle-btn.applied:not(.active):hover {
  border-color: #4caf50;
  background: #e8f5e9;
}

.toggle-btn.not-applied:not(.active):hover {
  border-color: #f44336;
  background: #ffebee;
}

.evaluation-question .form-group {
  margin-bottom: 0;
}

.evaluation-question .form-group label {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.evaluation-question .form-group textarea {
  font-size: 13px;
  padding: 10px;
}

/* Attachments Section */
.attachments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.attachments-header svg {
  flex-shrink: 0;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #555;
  text-decoration: none;
  transition: all 0.2s;
}

.attachment-item:hover {
  background: #f8f9ff;
  border-color: #667eea;
  color: #667eea;
}

.attachment-item svg {
  flex-shrink: 0;
}

.attachment-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
