<template>
  <AppLayout>
    <div class="workflow-review">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Workflow Review</h1>
          <p>Review and assign requests to workflow paths</p>
        </div>
        <BaseButton variant="secondary" @click="loadRequests">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          Refresh
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
        <p>Loading pending requests...</p>
      </div>

      <!-- Empty State -->
      <BaseCard v-else-if="requests.length === 0" class="empty-state-card">
        <div class="empty-state">
          <svg width="96" height="96" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          <h2>No Pending Requests</h2>
          <p>There are no pending requests to review at the moment.</p>
        </div>
      </BaseCard>

      <!-- Requests List -->
      <div v-else>
        <!-- Filter Bar -->
        <div class="filter-bar">
          <button
            @click="filterStatus = 'all'"
            :class="['filter-chip', { active: filterStatus === 'all' }]"
          >
            All Requests
            <span class="count">{{ requests.length }}</span>
          </button>
          <button
            @click="filterStatus = 'pending'"
            :class="['filter-chip', { active: filterStatus === 'pending' }]"
          >
            Pending Assignment
            <span class="count">{{ getPendingCount() }}</span>
          </button>
          <button
            @click="filterStatus = 'in_review'"
            :class="['filter-chip', { active: filterStatus === 'in_review' }]"
          >
            Final Validation
            <span class="count">{{ getInReviewCount() }}</span>
          </button>
        </div>

        <!-- Requests Grid -->
        <div class="requests-grid">
          <BaseCard
            v-for="request in filteredRequests"
            :key="request.id"
            class="request-card"
          >
            <!-- Request Header -->
            <div class="request-header">
              <div class="request-title-section">
                <h3>{{ request.title }}</h3>
                <p class="request-id">#{{ request.id }}</p>
              </div>
              <BaseBadge :variant="getStatusVariant(request.status)">
                {{ formatStatus(request.status) }}
              </BaseBadge>
            </div>

            <!-- Request Description -->
            <p class="request-description">{{ request.description }}</p>

            <!-- Request Meta -->
            <div class="request-meta">
              <div class="meta-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                <span>{{ request.user?.name }}</span>
              </div>
              <div class="meta-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                <span>{{ formatDate(request.submitted_at) }}</span>
              </div>
              <div v-if="request.attachments?.length > 0" class="meta-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                </svg>
                <span>{{ request.attachments.length }} files</span>
              </div>
            </div>

            <!-- Evaluation Status -->
            <div class="evaluation-status">
              <div v-if="!requestEvaluationStatus[request.id]" class="evaluation-warning">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Complete evaluation before taking action
              </div>
              <div v-else class="evaluation-complete">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Evaluation completed
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="request-actions">
              <!-- Initial pending request actions -->
              <template v-if="request.status === 'pending' && !request.workflow_path_id">
                <BaseButton
                  variant="success"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'assign')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Assign Path
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'details')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  Request Details
                </BaseButton>
                <BaseButton
                  variant="error"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'reject')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  Reject
                </BaseButton>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="openEvaluationModal(request, null)"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                  </svg>
                  {{ requestEvaluationStatus[request.id] ? 'View Evaluation' : 'Start Evaluation' }}
                </BaseButton>
              </template>

              <!-- Request returned from department for final validation -->
              <template v-else-if="request.status === 'in_review' && request.workflow_path_id">
                <BaseButton
                  variant="success"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'complete')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  Complete Request
                </BaseButton>
                <BaseButton
                  variant="warning"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'returnPrevious')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Return to Previous Dept
                </BaseButton>
                <BaseButton
                  variant="error"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'reject')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  Reject
                </BaseButton>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="openEvaluationModal(request, null)"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                  </svg>
                  {{ requestEvaluationStatus[request.id] ? 'View Evaluation' : 'Start Evaluation' }}
                </BaseButton>
              </template>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Evaluation Modal -->
    <div v-if="evaluationModal.show" class="modal-overlay" @click="closeEvaluationModal">
      <div class="modal-content evaluation-modal" @click.stop>
        <div class="modal-header">
          <h2>Request Evaluation</h2>
          <button @click="closeEvaluationModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">Please evaluate this request before proceeding</p>

        <div v-if="evaluationModal.isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading questions...</p>
        </div>

        <div v-else-if="evaluationQuestions.length === 0" class="alert alert-warning">
          No evaluation questions configured. Please contact admin to set up evaluation questions.
        </div>

        <div v-else class="evaluation-form">
          <div v-for="(question, index) in evaluationQuestions" :key="question.id" class="evaluation-question">
            <div class="question-header">
              <BaseBadge variant="primary">Q{{ index + 1 }}</BaseBadge>
              <BaseBadge variant="gray">Applied / Not Applied</BaseBadge>
            </div>
            <p class="question-text">{{ question.question }}</p>

            <div class="answer-section">
              <label>Answer *</label>
              <div class="toggle-buttons">
                <button
                  type="button"
                  :class="['toggle-btn', 'toggle-applied', { active: evaluationModal.answers[question.id]?.is_applied === true }]"
                  @click="setAnswer(question.id, true)"
                >
                  ✓ Applied
                </button>
                <button
                  type="button"
                  :class="['toggle-btn', 'toggle-not-applied', { active: evaluationModal.answers[question.id]?.is_applied === false }]"
                  @click="setAnswer(question.id, false)"
                >
                  ✗ Not Applied
                </button>
              </div>
            </div>

            <div class="notes-section">
              <label>Notes (Optional)</label>
              <textarea
                v-model="evaluationModal.answers[question.id].notes"
                placeholder="Add any notes about this evaluation..."
                rows="2"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <div class="evaluation-summary">
            <strong>Progress:</strong> {{ answeredCount }} / {{ evaluationQuestions.length }} questions answered
          </div>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeEvaluationModal">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="submitEvaluationAndProceed"
            :disabled="!allQuestionsAnswered || evaluationModal.isSaving"
            :loading="evaluationModal.isSaving"
          >
            Submit & Continue
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Assign Path Modal -->
    <div v-if="assignModal.show" class="modal-overlay" @click="closeAssignModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Assign Workflow Path</h2>
          <button @click="closeAssignModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">Request: {{ assignModal.request?.title }}</p>

        <div class="form-group">
          <label class="form-label">Select Workflow Path *</label>
          <div class="paths-list">
            <div
              v-for="path in workflowPaths"
              :key="path.id"
              :class="['path-option', { selected: assignModal.pathId === path.id }]"
              @click="assignModal.pathId = path.id"
            >
              <div class="path-header">
                <strong>{{ path.name }}</strong>
              </div>
              <p class="path-description">{{ path.description }}</p>
              <div class="path-steps">
                <strong>Steps:</strong>
                <span v-for="(step, index) in path.steps" :key="step.id">
                  {{ step.department?.name }}<span v-if="index < path.steps.length - 1"> → </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Comments (Optional)</label>
          <textarea
            v-model="assignModal.comments"
            placeholder="Add any comments about this assignment..."
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeAssignModal">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmAssign"
            :disabled="!assignModal.pathId || assignModal.isLoading"
            :loading="assignModal.isLoading"
          >
            Assign Path
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div v-if="detailsModal.show" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Request More Details</h2>
          <button @click="closeDetailsModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">Request: {{ detailsModal.request?.title }}</p>

        <div class="form-group">
          <label class="form-label">What additional information do you need? *</label>
          <textarea
            v-model="detailsModal.comments"
            placeholder="Explain what details are needed from the user..."
            rows="4"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeDetailsModal">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmRequestDetails"
            :disabled="!detailsModal.comments || detailsModal.isLoading"
            :loading="detailsModal.isLoading"
          >
            Request Details
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="rejectModal.show" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Reject Request</h2>
          <button @click="closeRejectModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">Request: {{ rejectModal.request?.title }}</p>

        <div class="alert alert-warning">
          <strong>Warning:</strong> This will permanently reject the request and end the workflow.
        </div>

        <div class="form-group">
          <label class="form-label">Rejection Reason *</label>
          <textarea
            v-model="rejectModal.reason"
            placeholder="Explain why this request is being rejected..."
            rows="4"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeRejectModal">
            Cancel
          </BaseButton>
          <BaseButton
            variant="error"
            @click="confirmReject"
            :disabled="!rejectModal.reason || rejectModal.isLoading"
            :loading="rejectModal.isLoading"
          >
            Reject Request
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Complete Request Modal -->
    <div v-if="completeModal.show" class="modal-overlay" @click="closeCompleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Complete Request</h2>
          <button @click="closeCompleteModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">Request: {{ completeModal.request?.title }}</p>

        <div class="alert alert-success">
          <strong>Final Approval:</strong> This will mark the request as completed and close the workflow.
        </div>

        <div class="form-group">
          <label class="form-label">Final Comments (Optional)</label>
          <textarea
            v-model="completeModal.comments"
            placeholder="Add any final comments about the completion..."
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeCompleteModal">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmComplete"
            :disabled="completeModal.isLoading"
            :loading="completeModal.isLoading"
          >
            Complete Request
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Return to Previous Department Modal -->
    <div v-if="returnToPreviousModal.show" class="modal-overlay" @click="closeReturnToPreviousModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Return to Previous Department</h2>
          <button @click="closeReturnToPreviousModal" class="modal-close">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">Request: {{ returnToPreviousModal.request?.title }}</p>

        <div class="alert alert-warning">
          <strong>Note:</strong> This will send the request back to the previous department for revision.
        </div>

        <div class="form-group">
          <label class="form-label">Reason for Return *</label>
          <textarea
            v-model="returnToPreviousModal.comments"
            placeholder="Explain what needs to be revised..."
            rows="4"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeReturnToPreviousModal">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmReturnToPrevious"
            :disabled="!returnToPreviousModal.comments || returnToPreviousModal.isLoading"
            :loading="returnToPreviousModal.isLoading"
          >
            Return to Department
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
import axios from 'axios'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseBadge from '../components/BaseBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

const requests = ref([])
const workflowPaths = ref([])
const evaluationQuestions = ref([])
const error = ref(null)
const success = ref(null)
const isLoading = ref(true)
const filterStatus = ref('all')
const requestEvaluationStatus = ref({})

const assignModal = ref({
  show: false,
  request: null,
  pathId: null,
  comments: '',
  isLoading: false
})

const detailsModal = ref({
  show: false,
  request: null,
  comments: '',
  isLoading: false
})

const rejectModal = ref({
  show: false,
  request: null,
  reason: '',
  isLoading: false
})

const completeModal = ref({
  show: false,
  request: null,
  comments: '',
  isLoading: false
})

const returnToPreviousModal = ref({
  show: false,
  request: null,
  comments: '',
  isLoading: false
})

const evaluationModal = ref({
  show: false,
  request: null,
  answers: {},
  nextAction: null,
  isLoading: false,
  isSaving: false
})

const answeredCount = computed(() => {
  return Object.values(evaluationModal.value.answers).filter(a => a.is_applied !== null && a.is_applied !== undefined).length
})

const allQuestionsAnswered = computed(() => {
  return answeredCount.value === evaluationQuestions.value.length && evaluationQuestions.value.length > 0
})

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') {
    return requests.value
  }
  if (filterStatus.value === 'pending') {
    return requests.value.filter(r => r.status === 'pending' && !r.workflow_path_id)
  }
  if (filterStatus.value === 'in_review') {
    return requests.value.filter(r => r.status === 'in_review' && r.workflow_path_id)
  }
  return requests.value
})

const API_URL = 'http://localhost:8000/api'

onMounted(async () => {
  await loadWorkflowPaths()
  await loadRequests()
})

const getPendingCount = () => {
  return requests.value.filter(r => r.status === 'pending' && !r.workflow_path_id).length
}

const getInReviewCount = () => {
  return requests.value.filter(r => r.status === 'in_review' && r.workflow_path_id).length
}

const loadRequests = async () => {
  try {
    isLoading.value = true
    error.value = null

    console.log('WorkflowReview: Loading pending requests...')
    console.log('Token exists:', authStore.token ? 'Yes' : 'No')

    const response = await axios.get(`${API_URL}/workflow/pending-requests`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    console.log('WorkflowReview: Response received:', response.data)
    requests.value = response.data.requests

    // Load evaluation status for each request
    const evaluationStatusPromises = requests.value.map(async (request) => {
      try {
        const evalResponse = await axios.get(
          `${API_URL}/workflow/requests/${request.id}/evaluation-questions`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )
        requestEvaluationStatus.value[request.id] = evalResponse.data.has_evaluated
      } catch (err) {
        console.error(`Failed to load evaluation status for request ${request.id}:`, err)
        requestEvaluationStatus.value[request.id] = false
      }
    })

    await Promise.all(evaluationStatusPromises)
    console.log('WorkflowReview: All data loaded successfully')
  } catch (err) {
    console.error('WorkflowReview: Failed to load requests:', err)
    console.error('WorkflowReview: Error response:', err.response?.data)
    error.value = err.response?.data?.message || err.message || 'Failed to load requests'
  } finally {
    isLoading.value = false
  }
}

const loadWorkflowPaths = async () => {
  try {
    const response = await axios.get(`${API_URL}/workflow/paths`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    workflowPaths.value = response.data.paths
  } catch (err) {
    console.error('Failed to load workflow paths:', err)
  }
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

const getStatusVariant = (status) => {
  const variants = {
    pending: 'warning',
    in_review: 'info',
    need_more_details: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'success'
  }
  return variants[status] || 'gray'
}

// Assign Path Modal
const openAssignModal = (request) => {
  assignModal.value.show = true
  assignModal.value.request = request
  assignModal.value.pathId = null
  assignModal.value.comments = ''
}

const closeAssignModal = () => {
  assignModal.value.show = false
  assignModal.value.request = null
  assignModal.value.pathId = null
  assignModal.value.comments = ''
}

const confirmAssign = async () => {
  try {
    assignModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/workflow/requests/${assignModal.value.request.id}/assign-path`,
      {
        workflow_path_id: assignModal.value.pathId,
        comments: assignModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = 'Request assigned to workflow path successfully'
    closeAssignModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to assign path'
  } finally {
    assignModal.value.isLoading = false
  }
}

// Request Details Modal
const openDetailsModal = (request) => {
  detailsModal.value.show = true
  detailsModal.value.request = request
  detailsModal.value.comments = ''
}

const closeDetailsModal = () => {
  detailsModal.value.show = false
  detailsModal.value.request = null
  detailsModal.value.comments = ''
}

const confirmRequestDetails = async () => {
  try {
    detailsModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/workflow/requests/${detailsModal.value.request.id}/request-details`,
      {
        comments: detailsModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = 'More details requested from user successfully'
    closeDetailsModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to request details'
  } finally {
    detailsModal.value.isLoading = false
  }
}

// Reject Modal
const openRejectModal = (request) => {
  rejectModal.value.show = true
  rejectModal.value.request = request
  rejectModal.value.reason = ''
}

const closeRejectModal = () => {
  rejectModal.value.show = false
  rejectModal.value.request = null
  rejectModal.value.reason = ''
}

const confirmReject = async () => {
  try {
    rejectModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/workflow/requests/${rejectModal.value.request.id}/reject`,
      {
        rejection_reason: rejectModal.value.reason
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = 'Request rejected successfully'
    closeRejectModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reject request'
  } finally {
    rejectModal.value.isLoading = false
  }
}

// Complete Request Modal
const openCompleteModal = (request) => {
  completeModal.value.show = true
  completeModal.value.request = request
  completeModal.value.comments = ''
}

const closeCompleteModal = () => {
  completeModal.value.show = false
  completeModal.value.request = null
  completeModal.value.comments = ''
}

const confirmComplete = async () => {
  try {
    completeModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/workflow/requests/${completeModal.value.request.id}/complete`,
      {
        comments: completeModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = 'Request completed successfully'
    closeCompleteModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to complete request'
  } finally {
    completeModal.value.isLoading = false
  }
}

// Return to Previous Department Modal
const openReturnToPreviousModal = (request) => {
  returnToPreviousModal.value.show = true
  returnToPreviousModal.value.request = request
  returnToPreviousModal.value.comments = ''
}

const closeReturnToPreviousModal = () => {
  returnToPreviousModal.value.show = false
  returnToPreviousModal.value.request = null
  returnToPreviousModal.value.comments = ''
}

const confirmReturnToPrevious = async () => {
  try {
    returnToPreviousModal.value.isLoading = true
    error.value = null

    await axios.post(
      `${API_URL}/workflow/requests/${returnToPreviousModal.value.request.id}/return-to-previous`,
      {
        comments: returnToPreviousModal.value.comments
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = 'Request returned to previous department successfully'
    closeReturnToPreviousModal()
    await loadRequests()

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to return request'
  } finally {
    returnToPreviousModal.value.isLoading = false
  }
}

// Evaluation Modal Methods
const checkEvaluationAndOpen = async (request, action) => {
  try {
    // Check if request has been evaluated
    const response = await axios.get(
      `${API_URL}/workflow/requests/${request.id}/evaluation-questions`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    if (response.data.has_evaluated) {
      // Already evaluated, proceed directly
      openModalForAction(request, action)
    } else {
      // Need evaluation, open evaluation modal first
      await openEvaluationModal(request, action)
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to check evaluation'
  }
}

const openEvaluationModal = async (request, nextAction) => {
  try {
    evaluationModal.value.isLoading = true
    evaluationModal.value.show = true
    evaluationModal.value.request = request
    evaluationModal.value.nextAction = nextAction

    const response = await axios.get(
      `${API_URL}/workflow/requests/${request.id}/evaluation-questions`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    evaluationQuestions.value = response.data.questions

    // Initialize answers object
    const answers = {}
    response.data.questions.forEach(q => {
      const existing = response.data.evaluations[q.id]
      answers[q.id] = {
        is_applied: existing?.is_applied !== undefined ? existing.is_applied : null,
        notes: existing?.notes || ''
      }
    })

    evaluationModal.value.answers = answers
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load evaluation questions'
    closeEvaluationModal()
  } finally {
    evaluationModal.value.isLoading = false
  }
}

const closeEvaluationModal = () => {
  evaluationModal.value = {
    show: false,
    request: null,
    answers: {},
    nextAction: null,
    isLoading: false,
    isSaving: false
  }
  evaluationQuestions.value = []
}

const setAnswer = (questionId, isApplied) => {
  if (!evaluationModal.value.answers[questionId]) {
    evaluationModal.value.answers[questionId] = { is_applied: null, notes: '' }
  }
  evaluationModal.value.answers[questionId].is_applied = isApplied
}

const submitEvaluationAndProceed = async () => {
  try {
    evaluationModal.value.isSaving = true
    error.value = null

    // Format evaluations for API
    const evaluations = Object.keys(evaluationModal.value.answers).map(questionId => ({
      question_id: parseInt(questionId),
      is_applied: evaluationModal.value.answers[questionId].is_applied,
      notes: evaluationModal.value.answers[questionId].notes
    }))

    // Submit evaluation
    await axios.post(
      `${API_URL}/workflow/requests/${evaluationModal.value.request.id}/evaluation`,
      { evaluations },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = 'Evaluation submitted successfully'

    // Get the request and action before closing modal
    const request = evaluationModal.value.request
    const action = evaluationModal.value.nextAction

    // Update evaluation status
    requestEvaluationStatus.value[request.id] = true

    closeEvaluationModal()

    // Open the appropriate modal for the action if there is one
    if (action) {
      openModalForAction(request, action)
    }

    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit evaluation'
  } finally {
    evaluationModal.value.isSaving = false
  }
}

const openModalForAction = (request, action) => {
  switch (action) {
    case 'assign':
      openAssignModal(request)
      break
    case 'details':
      openDetailsModal(request)
      break
    case 'reject':
      openRejectModal(request)
      break
    case 'complete':
      openCompleteModal(request)
      break
    case 'returnPrevious':
      openReturnToPreviousModal(request)
      break
  }
}
</script>

<style scoped>
.workflow-review {
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

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: 0;
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

.request-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-4);
}

.request-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
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

/* Evaluation Status */
.evaluation-status {
  margin-bottom: var(--spacing-4);
}

.evaluation-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--radius-lg);
  color: var(--color-warning-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.evaluation-complete {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-radius: var(--radius-lg);
  color: var(--color-success-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* Request Actions */
.request-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: auto;
}

/* Modal Styles */
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
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.modal-content {
  background: var(--color-background);
  border-radius: var(--radius-2xl);
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.modal-header h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.modal-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-6);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);
}

.modal-actions > * {
  flex: 1;
}

/* Workflow Paths */
.paths-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.path-option {
  padding: var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.path-option:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.path-option.selected {
  border-color: var(--color-primary-600);
  background: var(--color-primary-50);
}

.path-header strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.path-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: var(--spacing-2) 0;
}

.path-steps {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-2);
}

.path-steps strong {
  color: var(--color-text-primary);
}

/* Evaluation Form */
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

.notes-section label {
  display: block;
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
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

  .request-actions {
    flex-direction: column;
  }

  .modal-content {
    padding: var(--spacing-6);
  }

  .modal-actions {
    flex-direction: column;
  }

  .toggle-buttons {
    flex-direction: column;
  }
}
</style>
