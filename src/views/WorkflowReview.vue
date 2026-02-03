<template>
  <AppLayout>
    <div class="workflow-review">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>{{ $t('workflow.title') }}</h1>
          <p>{{ $t('workflow.subtitle') }}</p>
        </div>
        <BaseButton
          variant="secondary"
          @click="loadRequests"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
          {{ $t('common.refresh') }}
        </BaseButton>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="alert alert-error"
      >
        {{ error }}
      </div>

      <!-- Success Alert -->
      <div
        v-if="success"
        class="alert alert-success"
      >
        {{ success }}
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Loading pending requests...</p>
      </div>

      <!-- Empty State -->
      <BaseCard
        v-else-if="requests.length === 0"
        class="empty-state-card"
      >
        <div class="empty-state">
          <svg
            width="96"
            height="96"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <h2>No Pending Requests</h2>
          <p>There are no pending requests to review at the moment.</p>
        </div>
      </BaseCard>

      <!-- Requests List -->
      <div v-else>
        <!-- Filter Bar -->
        <div class="filter-bar" :dir="$t('dir')">
          <button
            @click="filterStatus = 'all'"
            :class="['filter-chip', { active: filterStatus === 'all' }]"
          >
            {{ $t('workflow.allRequestsTitle') }}
            <span class="count">{{ requests.length }}</span>
          </button>
          <button
            @click="filterStatus = 'pending'"
            :class="['filter-chip', { active: filterStatus === 'pending' }]"
          >
            {{ $t('workflow.pendingAssignment') }}
            <span class="count">{{ getPendingCount() }}</span>
          </button>
          <button
            @click="filterStatus = 'in_review'"
            :class="['filter-chip', { active: filterStatus === 'in_review' }]"
          >
            {{ $t('workflow.finalValidation') }}
            <span class="count">{{ getInReviewCount() }}</span>
          </button>
        </div>

        <!-- Requests Grid -->
        <div class="requests-grid">
          <RequestCard
            v-for="request in filteredRequests"
            :key="request.id"
            :request="request"
            :show-description="true"
            :show-submitter="true"
            :show-department="true"
            :show-date="true"
            :show-expected-date="true"
            :show-attachments="true"
            :show-attachments-list="true"
            :show-latest-comment="true"
          >
            <template #extra-content>
              <!-- View Details Button -->
              <div class="view-details-container">
                <button
                  class="view-details-btn"
                  @click="viewRequestDetails(request)"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fill-rule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('request.viewDetails') }}
                </button>
              </div>

              <!-- Idea Ownership Badge -->
              <div
                v-if="request.idea_ownership"
                class="idea-type-section"
              >
                <span :class="['ownership-badge', request.idea_ownership === 'shared' ? 'shared' : 'individual']">
                  {{ request.idea_ownership === 'shared' ? $t('request.sharedIdea') : $t('request.individualIdea') }}
                </span>
              </div>

              <!-- Idea Category Badge -->
              <div
                v-if="(request.ideaTypes || request.idea_types) && ((request.ideaTypes?.length || 0) > 0 || (request.idea_types?.length || 0) > 0)"
                class="idea-category-section"
              >
                <span
                  v-for="ideaType in (request.ideaTypes || request.idea_types)"
                  :key="ideaType.id"
                  class="idea-type-badge"
                  :style="{ backgroundColor: ideaType.color + '20', color: ideaType.color, borderColor: ideaType.color }"
                >
                  {{ $i18n.locale === 'ar' ? ideaType.name_ar : ideaType.name }}
                </span>
              </div>

              <!-- Benefits Section -->
              <div
                v-if="request.benefits"
                class="benefits-section"
              >
                <label class="section-label">{{ $t('request.benefits') }}</label>
                <p class="benefits-text">{{ request.benefits }}</p>
              </div>

              <!-- Collaborating Employees Section -->
              <div
                v-if="request.employees && request.employees.length > 0"
                class="employees-section"
              >
                <div class="employees-header">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{{ $t('request.collaboratingEmployees') }} ({{ request.employees.length }}):</span>
                </div>
                <div class="employees-list">
                  <div
                    v-for="employee in request.employees"
                    :key="employee.id"
                    class="employee-item"
                  >
                    <div class="employee-avatar">
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="employee-info">
                      <span class="employee-name">{{ employee.employee_name }}</span>
                      <span
                        v-if="employee.employee_email"
                        class="employee-detail"
                      >{{ employee.employee_email }}</span>
                      <span
                        v-if="employee.employee_department"
                        class="employee-detail"
                      >{{ employee.employee_department }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Evaluation Status -->
              <div class="evaluation-status">
                <div
                  v-if="!requestEvaluationStatus[request.id]"
                  class="evaluation-warning"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('workflow.evaluationRequired') }}
                </div>
                <div
                  v-else
                  class="evaluation-complete"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('workflow.evaluationCompleted') }}
                </div>
              </div>
            </template>

            <!-- Action Buttons -->
            <template #actions>
              <!-- Initial pending request actions -->
              <template v-if="request.status === 'pending' && !request.workflow_path_id">
                <BaseButton
                  variant="success"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'assign')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('workflow.assignPath') }}
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'details')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {{ $t('workflow.requestDetails') }}
                </BaseButton>
                <BaseButton
                  variant="error"
                  size="sm"
                  @click="checkEvaluationAndOpen(request, 'reject')"
                  :disabled="!requestEvaluationStatus[request.id]"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('workflow.reject') }}
                </BaseButton>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="openEvaluationModal(request, null)"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fill-rule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ requestEvaluationStatus[request.id] ? $t('workflow.viewEditEvaluation') : $t('workflow.startEvaluation') }}
                </BaseButton>
              </template>

              <!-- Request with workflow path but pending (after details provided) or in review -->
              <template v-else-if="request.workflow_path_id && (request.status === 'in_review' || request.status === 'pending')">
                <!-- If request went through employee processing, show final actions -->
                <template v-if="request.went_through_employee_processing">
                  <BaseButton
                    variant="success"
                    size="sm"
                    @click="checkEvaluationAndOpen(request, 'complete')"
                    :disabled="!requestEvaluationStatus[request.id]"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.implementation_approval') }}
                  </BaseButton>
                  <BaseButton
                    variant="warning"
                    size="sm"
                    @click="checkEvaluationAndOpen(request, 'returnPrevious')"
                    :disabled="!requestEvaluationStatus[request.id]"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.returnToPrevious') }}
                  </BaseButton>
                  <BaseButton
                    variant="error"
                    size="sm"
                    @click="checkEvaluationAndOpen(request, 'reject')"
                    :disabled="!requestEvaluationStatus[request.id] || request.went_through_employee_processing"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.reject') }}
                  </BaseButton>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    @click="openEvaluationModal(request, null)"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.viewEvaluation') }}
                  </BaseButton>
                </template>

                <!-- If request returned WITHOUT employee processing, show initial actions -->
                <template v-else>
                  <BaseButton
                    variant="success"
                    size="sm"
                    @click="checkEvaluationAndOpen(request, 'assign')"
                    :disabled="!requestEvaluationStatus[request.id]"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.assignPath') }}
                  </BaseButton>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="checkEvaluationAndOpen(request, 'details')"
                    :disabled="!requestEvaluationStatus[request.id]"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    {{ $t('workflow.requestDetails') }}
                  </BaseButton>
                  <BaseButton
                    variant="error"
                    size="sm"
                    @click="checkEvaluationAndOpen(request, 'reject')"
                    :disabled="!requestEvaluationStatus[request.id]"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.reject') }}
                  </BaseButton>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    @click="openEvaluationModal(request, null)"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ $t('workflow.viewEvaluation') }}
                  </BaseButton>
                </template>
              </template>
            </template>
          </RequestCard>
        </div>
      </div>
    </div>

    <!-- Evaluation Modal -->
    <div
      v-if="evaluationModal.show"
      class="modal-overlay"
      @click="closeEvaluationModal"
    >
      <div
        class="modal-content evaluation-modal"
        @click.stop
      >
        <div class="modal-header">
          <h2>{{ evaluationModal.readOnly ? $t('evaluation.viewEvaluation') : $t('evaluation.requestEvaluation') }}</h2>
          <button
            @click="closeEvaluationModal"
            class="modal-close"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ evaluationModal.readOnly ? $t('evaluation.evaluationReadOnly') : $t('evaluation.evaluateBeforeProceeding') }}</p>

        <div
          v-if="evaluationModal.isLoading"
          class="loading-state"
        >
          <div class="spinner"></div>
          <p>{{ $t('evaluation.loadingQuestions') }}</p>
        </div>

        <div
          v-else-if="evaluationQuestions.length === 0"
          class="alert alert-warning"
        >
          {{ $t('evaluation.noQuestionsConfigured') }}
        </div>

        <div
          v-else
          class="evaluation-form"
        >
          <div
            v-for="(question, index) in evaluationQuestions"
            :key="question.id"
            class="evaluation-question"
          >
            <div class="question-header">
              <BaseBadge variant="primary">{{ $t('evaluation.questionLabel', { number: index + 1 }) }}</BaseBadge>
              <BaseBadge variant="gray">{{ $t('evaluation.appliedNotApplied') }}</BaseBadge>
            </div>
            <p class="question-text">{{ question.question }}</p>

            <div class="answer-section">
              <label>{{ $t('evaluation.answer') }} *</label>
              <div class="toggle-buttons">
                <button
                  type="button"
                  :class="['toggle-btn', 'toggle-applied', { active: evaluationModal.answers[question.id]?.is_applied === true }]"
                  @click="setAnswer(question.id, true)"
                  :disabled="evaluationModal.readOnly"
                >
                  ✓ {{ $t('evaluation.applied') }}
                </button>
                <button
                  type="button"
                  :class="['toggle-btn', 'toggle-not-applied', { active: evaluationModal.answers[question.id]?.is_applied === false }]"
                  @click="setAnswer(question.id, false)"
                  :disabled="evaluationModal.readOnly"
                >
                  ✗ {{ $t('evaluation.notApplied') }}
                </button>
              </div>
            </div>

            <div class="notes-section">
              <label>{{ $t('evaluation.notesOptional') }}</label>
              <textarea
                v-model="evaluationModal.answers[question.id].notes"
                :placeholder="$t('evaluation.notesPlaceholder')"
                rows="2"
                class="form-textarea"
                :disabled="evaluationModal.readOnly"
              ></textarea>
            </div>
          </div>

          <div class="evaluation-summary">
            <strong>{{ $t('evaluation.progress') }}:</strong> {{ answeredCount }} / {{ evaluationQuestions.length }} {{ $t('evaluation.questionsAnswered') }}
          </div>
        </div>

        <div class="modal-actions">
          <BaseButton
            variant="secondary"
            @click="closeEvaluationModal"
          >
            {{ evaluationModal.readOnly ? $t('common.close') : $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            v-if="!evaluationModal.readOnly"
            variant="primary"
            @click="submitEvaluationAndProceed"
            :disabled="!allQuestionsAnswered || evaluationModal.isSaving"
            :loading="evaluationModal.isSaving"
          >
            {{ $t('evaluation.submitContinue') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Assign Path Modal -->
    <div
      v-if="assignModal.show"
      class="modal-overlay"
      @click="closeAssignModal"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h2>{{ $t('workflow.assignWorkflowPath') }}</h2>
          <button
            @click="closeAssignModal"
            class="modal-close"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ $t('workflow.request') }}: {{ assignModal.request?.title }}</p>

        <div class="form-group">
          <label class="form-label">{{ $t('workflow.selectWorkflowPath') }} *</label>
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
                <strong>{{ $t('workflow.steps') }}:</strong>
                <span
                  v-for="(step, index) in path.steps"
                  :key="step.id"
                >
                  {{ step.department?.name }}<span v-if="index < path.steps.length - 1"> → </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('department.commentsOptional') }}</label>
          <textarea
            v-model="assignModal.comments"
            :placeholder="$t('workflow.addCommentsPlaceholder')"
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton
            variant="secondary"
            @click="closeAssignModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmAssign"
            :disabled="!assignModal.pathId || assignModal.isLoading"
            :loading="assignModal.isLoading"
          >
            {{ $t('workflow.assignPath') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div
      v-if="detailsModal.show"
      class="modal-overlay"
      @click="closeDetailsModal"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h2>{{ $t('workflow.requestMoreDetails') }}</h2>
          <button
            @click="closeDetailsModal"
            class="modal-close"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ detailsModal.request?.title }}</p>

        <div class="form-group">
          <label class="form-label">{{ $t('workflow.whatAdditionalInfo') }} *</label>
          <textarea
            v-model="detailsModal.comments"
            :placeholder="$t('workflow.explainDetailsNeeded')"
            rows="4"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton
            variant="secondary"
            @click="closeDetailsModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmRequestDetails"
            :disabled="!detailsModal.comments || detailsModal.isLoading"
            :loading="detailsModal.isLoading"
          >
            {{ $t('workflow.requestDetails') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="rejectModal.show"
      class="modal-overlay"
      @click="closeRejectModal"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h2>{{ $t('workflow.rejectRequest') }}</h2>
          <button
            @click="closeRejectModal"
            class="modal-close"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ rejectModal.request?.title }}</p>

        <div class="alert alert-warning">
          <strong>{{ $t('common.warning') }}:</strong> {{ $t('workflow.permanentRejectionWarning') }}
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('workflow.rejectionReason') }} *</label>
          <textarea
            v-model="rejectModal.reason"
            :placeholder="$t('workflow.explainRejection')"
            rows="4"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton
            variant="secondary"
            @click="closeRejectModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="error"
            @click="confirmReject"
            :disabled="!rejectModal.reason || rejectModal.isLoading"
            :loading="rejectModal.isLoading"
          >
            {{ $t('workflow.rejectRequest') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Complete Request Modal -->
    <div
      v-if="completeModal.show"
      class="modal-overlay"
      @click="closeCompleteModal"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h2>{{ $t('workflow.completeRequest') }}</h2>
          <button
            @click="closeCompleteModal"
            class="modal-close"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ $t('workflow.request') }}: {{ completeModal.request?.title }}</p>

        <div class="alert alert-success">
          <strong>{{ $t('workflow.completeRequest') }}:</strong> {{ $t('workflow.finalApprovalNote') }}
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('workflow.finalComments') }}</label>
          <textarea
            v-model="completeModal.comments"
            :placeholder="$t('workflow.finalCommentsPlaceholder')"
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- File Attachments -->
        <div class="form-group">
          <label class="form-label">{{ $t('request.attachments') }} ({{ $t('common.optional') }})</label>
          <div class="file-upload-area">
            <input
              type="file"
              ref="completeFileInput"
              @change="handleCompleteFileSelect"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              class="file-input"
              id="complete-file-input"
              :disabled="completeModal.attachments.length >= 5"
            />
            <label
              for="complete-file-input"
              class="file-upload-label"
              :class="{ disabled: completeModal.attachments.length >= 5 }"
            >
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span v-if="completeModal.attachments.length < 5">
                {{ $t('request.clickToUpload') }} ({{ completeModal.attachments.length }}/5)
              </span>
              <span v-else>{{ $t('request.maxFilesReached') }}</span>
            </label>
            <p class="file-upload-hint">{{ $t('request.supportedFormats') }}: PDF, JPG, JPEG, PNG ({{ $t('request.maxSize') }}: 10MB)</p>
          </div>

          <!-- Selected Files List -->
          <div
            v-if="completeModal.attachments.length > 0"
            class="selected-files-list"
          >
            <div
              v-for="(file, index) in completeModal.attachments"
              :key="index"
              class="file-item"
            >
              <div class="file-info">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="file-details">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatCompleteFileSize(file.size) }}</span>
                </div>
              </div>
              <button
                type="button"
                @click="removeCompleteAttachment(index)"
                class="remove-file-btn"
                :title="$t('common.remove')"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <BaseButton
            variant="secondary"
            @click="closeCompleteModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmComplete"
            :disabled="completeModal.isLoading"
            :loading="completeModal.isLoading"
          >
            {{ $t('workflow.completeRequest') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Return to Previous Department Modal -->
    <div
      v-if="returnToPreviousModal.show"
      class="modal-overlay"
      @click="closeReturnToPreviousModal"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h2>{{ $t('workflow.returnToPreviousDepartment') }}</h2>
          <button
            @click="closeReturnToPreviousModal"
            class="modal-close"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <p class="modal-subtitle">{{ $t('request.request') }}: {{ returnToPreviousModal.request?.title }}</p>

        <div class="alert alert-warning">
          <strong>{{ $t('common.note') }}:</strong> {{ $t('workflow.returnToPreviousNote') }}
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('workflow.reasonForReturn') }} *</label>
          <textarea
            v-model="returnToPreviousModal.comments"
            :placeholder="$t('workflow.explainRevision')"
            rows="4"
            class="form-textarea"
            required
          ></textarea>
        </div>

        <div class="modal-actions">
          <BaseButton
            variant="secondary"
            @click="closeReturnToPreviousModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="confirmReturnToPrevious"
            :disabled="!returnToPreviousModal.comments || returnToPreviousModal.isLoading"
            :loading="returnToPreviousModal.isLoading"
          >
            {{ $t('workflow.returnToPrevious') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth";
import axios from "axios";
import AppLayout from "../components/AppLayout.vue";
import BaseCard from "../components/BaseCard.vue";
import BaseButton from "../components/BaseButton.vue";
import BaseBadge from "../components/BaseBadge.vue";
import RequestCard from "../components/RequestCard.vue";

const { t } = useI18n();
const { showSuccess, showError, showConfirm, showDeleteConfirm } = useAlert();

const router = useRouter();
const authStore = useAuthStore();

const requests = ref([]);
const workflowPaths = ref([]);
const evaluationQuestions = ref([]);
const error = ref(null);
const success = ref(null);
const isLoading = ref(true);
const filterStatus = ref("all");
const requestEvaluationStatus = ref({});

const assignModal = ref({
  show: false,
  request: null,
  pathId: null,
  comments: "",
  isLoading: false,
});

const detailsModal = ref({
  show: false,
  request: null,
  comments: "",
  isLoading: false,
});

const rejectModal = ref({
  show: false,
  request: null,
  reason: "",
  isLoading: false,
});

const completeModal = ref({
  show: false,
  request: null,
  comments: "",
  attachments: [],
  isLoading: false,
});

const returnToPreviousModal = ref({
  show: false,
  request: null,
  comments: "",
  isLoading: false,
});

const evaluationModal = ref({
  show: false,
  request: null,
  answers: {},
  nextAction: null,
  isLoading: false,
  isSaving: false,
  readOnly: false,
});

const answeredCount = computed(() => {
  return Object.values(evaluationModal.value.answers).filter(
    (a) => a.is_applied !== null && a.is_applied !== undefined
  ).length;
});

const allQuestionsAnswered = computed(() => {
  return (
    answeredCount.value === evaluationQuestions.value.length &&
    evaluationQuestions.value.length > 0
  );
});

const filteredRequests = computed(() => {
  if (filterStatus.value === "all") {
    return requests.value;
  }
  if (filterStatus.value === "pending") {
    return requests.value.filter(
      (r) => r.status === "pending" && !r.workflow_path_id
    );
  }
  if (filterStatus.value === "in_review") {
    return requests.value.filter(
      (r) => r.status === "in_review" && r.workflow_path_id
    );
  }
  return requests.value;
});

import { API_URL } from "../config/api";
import { useAlert } from "../composables/useAlert";
import { httpRequest } from "../services/api";

onMounted(async () => {
  await loadWorkflowPaths();
  await loadRequests();
});

const getPendingCount = () => {
  return requests.value.filter(
    (r) => r.status === "pending" && !r.workflow_path_id
  ).length;
};

const getInReviewCount = () => {
  return requests.value.filter(
    (r) => r.status === "in_review" && r.workflow_path_id
  ).length;
};

const loadRequests = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    console.log("WorkflowReview: Loading pending requests...");
    console.log("Token exists:", authStore.token ? "Yes" : "No");
    const response = await httpRequest(`/workflow/pending-requests`);
    console.log("WorkflowReview: Response received:", response.data);
    requests.value = response.data.requests;

    // Use evaluation status from response (included in each request object)
    requests.value.forEach((request) => {
      requestEvaluationStatus.value[request.id] =
        request.has_evaluated || false;
    });

    console.log("WorkflowReview: All data loaded successfully");
  } catch (err) {
    console.error("WorkflowReview: Failed to load requests:", err);
    console.error("WorkflowReview: Error response:", err.response?.data);
    showError(
      err.response?.data?.message || err.message || "Failed to load requests"
    );
  } finally {
    isLoading.value = false;
  }
};

const loadWorkflowPaths = async () => {
  try {
    const response = await httpRequest(`/workflow/paths`);
    workflowPaths.value = response.data.paths;
  } catch (err) {
    console.error("Failed to load workflow paths:", err);
  }
};

const formatStatus = (status) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusVariant = (status) => {
  const variants = {
    pending: "warning",
    in_review: "info",
    in_progress: "primary",
    need_more_details: "warning",
    missing_requirement: "warning",
    approved: "success",
    rejected: "error",
    completed: "success",
  };
  return variants[status] || "gray";
};

// View request details
const viewRequestDetails = (request) => {
  router.push(`/requests/${request.id}`);
};

// Assign Path Modal
const openAssignModal = (request) => {
  assignModal.value.show = true;
  assignModal.value.request = request;
  assignModal.value.pathId = null;
  assignModal.value.comments = "";
};

const closeAssignModal = () => {
  assignModal.value.show = false;
  assignModal.value.request = null;
  assignModal.value.pathId = null;
  assignModal.value.comments = "";
};

const confirmAssign = async () => {
  try {
    assignModal.value.isLoading = true;
    error.value = null;

    await axios.post(
      `${API_URL}/workflow/requests/${assignModal.value.request.id}/assign-path`,
      {
        workflow_path_id: assignModal.value.pathId,
        comments: assignModal.value.comments,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Close modal immediately after success
    closeAssignModal();

    showSuccess(t("messages.success.requestAssignedToPath"));

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch((err) => {
      console.error("Failed to reload requests:", err);
    });

    setTimeout(() => (success.value = null), 5000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to assign path");
    assignModal.value.isLoading = false;
  }
};

// Request Details Modal
const openDetailsModal = (request) => {
  detailsModal.value.show = true;
  detailsModal.value.request = request;
  detailsModal.value.comments = "";
};

const closeDetailsModal = () => {
  detailsModal.value.show = false;
  detailsModal.value.request = null;
  detailsModal.value.comments = "";
};

const confirmRequestDetails = async () => {
  try {
    detailsModal.value.isLoading = true;
    error.value = null;

    await axios.post(
      `${API_URL}/workflow/requests/${detailsModal.value.request.id}/request-details`,
      {
        comments: detailsModal.value.comments,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Close modal immediately after success
    closeDetailsModal();

    showSuccess(t("messages.success.moreDetailsRequested"));

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch((err) => {
      console.error("Failed to reload requests:", err);
    });

    setTimeout(() => (success.value = null), 5000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to request details");
    detailsModal.value.isLoading = false;
  }
};

// Reject Modal
const openRejectModal = (request) => {
  rejectModal.value.show = true;
  rejectModal.value.request = request;
  rejectModal.value.reason = "";
};

const closeRejectModal = () => {
  rejectModal.value.show = false;
  rejectModal.value.request = null;
  rejectModal.value.reason = "";
};

const confirmReject = async () => {
  try {
    rejectModal.value.isLoading = true;
    error.value = null;

    await axios.post(
      `${API_URL}/workflow/requests/${rejectModal.value.request.id}/reject`,
      {
        rejection_reason: rejectModal.value.reason,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Close modal immediately after success
    closeRejectModal();

    showSuccess(t("messages.success.requestRejectedSuccess"));

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch((err) => {
      console.error("Failed to reload requests:", err);
    });

    setTimeout(() => (success.value = null), 5000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to reject request");
    rejectModal.value.isLoading = false;
  }
};

// Complete Request Modal
const openCompleteModal = (request) => {
  completeModal.value.show = true;
  completeModal.value.request = request;
  completeModal.value.comments = "";
};

const closeCompleteModal = () => {
  completeModal.value.show = false;
  completeModal.value.request = null;
  completeModal.value.comments = "";
  completeModal.value.attachments = [];
};

const handleCompleteFileSelect = (event) => {
  const files = Array.from(event.target.files);
  const maxFiles = 5;
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const currentCount = completeModal.value.attachments.length;
  const remainingSlots = maxFiles - currentCount;

  if (files.length > remainingSlots) {
    showError(t('messages.error.maxFilesExceeded', { max: maxFiles }));
    return;
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      showError(t('messages.error.invalidFileType', { name: file.name }));
      continue;
    }

    if (file.size > maxSize) {
      showError(t('messages.error.fileTooLarge', { name: file.name, max: '10MB' }));
      continue;
    }

    completeModal.value.attachments.push(file);
  }

  // Reset input
  event.target.value = '';
};

const removeCompleteAttachment = (index) => {
  completeModal.value.attachments.splice(index, 1);
};

const formatCompleteFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const confirmComplete = async () => {
  try {
    completeModal.value.isLoading = true;
    error.value = null;

    // Create FormData to handle file uploads
    const formData = new FormData();

    // Add comments
    if (completeModal.value.comments) {
      formData.append('comments', completeModal.value.comments);
    }

    // Add file attachments
    completeModal.value.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    await axios.post(
      `${API_URL}/workflow/requests/${completeModal.value.request.id}/complete`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Close modal immediately after success
    closeCompleteModal();

    showSuccess(t("messages.success.requestCompleted"));

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch((err) => {
      console.error("Failed to reload requests:", err);
    });

    setTimeout(() => (success.value = null), 5000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to complete request");
    completeModal.value.isLoading = false;
  }
};

// Return to Previous Department Modal
const openReturnToPreviousModal = (request) => {
  returnToPreviousModal.value.show = true;
  returnToPreviousModal.value.request = request;
  returnToPreviousModal.value.comments = "";
};

const closeReturnToPreviousModal = () => {
  returnToPreviousModal.value.show = false;
  returnToPreviousModal.value.request = null;
  returnToPreviousModal.value.comments = "";
};

const confirmReturnToPrevious = async () => {
  try {
    returnToPreviousModal.value.isLoading = true;
    error.value = null;

    await axios.post(
      `${API_URL}/workflow/requests/${returnToPreviousModal.value.request.id}/return-to-previous`,
      {
        comments: returnToPreviousModal.value.comments,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Close modal immediately after success
    closeReturnToPreviousModal();

    showSuccess(t("messages.success.requestReturnedToPrevious"));

    // Reload requests (don't await to prevent blocking modal close)
    loadRequests().catch((err) => {
      console.error("Failed to reload requests:", err);
    });

    setTimeout(() => (success.value = null), 5000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to return request");
    returnToPreviousModal.value.isLoading = false;
  }
};

// Evaluation Modal Methods
const checkEvaluationAndOpen = async (request, action) => {
  try {
    // Check if request has been evaluated
    const response = await axios.get(
      `${API_URL}/workflow/requests/${request.id}/evaluation-questions`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (response.data.has_evaluated) {
      // Already evaluated, proceed directly
      openModalForAction(request, action);
    } else {
      // Need evaluation, open evaluation modal first
      await openEvaluationModal(request, action);
    }
  } catch (err) {
    showError(err.response?.data?.message || "Failed to check evaluation");
  }
};

const openEvaluationModal = async (request, nextAction) => {
  try {
    evaluationModal.value.isLoading = true;
    evaluationModal.value.show = true;
    evaluationModal.value.request = request;
    evaluationModal.value.nextAction = nextAction;
    // Evaluation is read-only after the idea is assigned to a path
    evaluationModal.value.readOnly = !!request.workflow_path_id;

    const response = await axios.get(
      `${API_URL}/workflow/requests/${request.id}/evaluation-questions`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    evaluationQuestions.value = response.data.questions;

    // Initialize answers object
    const answers = {};
    response.data.questions.forEach((q) => {
      const existing = response.data.evaluations[q.id];
      answers[q.id] = {
        is_applied:
          existing?.is_applied !== undefined ? existing.is_applied : null,
        notes: existing?.notes || "",
      };
    });

    evaluationModal.value.answers = answers;
  } catch (err) {
    showError(
      err.response?.data?.message || "Failed to load evaluation questions"
    );
    closeEvaluationModal();
  } finally {
    evaluationModal.value.isLoading = false;
  }
};

const closeEvaluationModal = () => {
  evaluationModal.value = {
    show: false,
    request: null,
    answers: {},
    nextAction: null,
    isLoading: false,
    isSaving: false,
    readOnly: false,
  };
  evaluationQuestions.value = [];
};

const setAnswer = (questionId, isApplied) => {
  if (!evaluationModal.value.answers[questionId]) {
    evaluationModal.value.answers[questionId] = { is_applied: null, notes: "" };
  }
  evaluationModal.value.answers[questionId].is_applied = isApplied;
};

const submitEvaluationAndProceed = async () => {
  try {
    evaluationModal.value.isSaving = true;
    error.value = null;

    // Format evaluations for API
    const evaluations = Object.keys(evaluationModal.value.answers).map(
      (questionId) => ({
        question_id: parseInt(questionId),
        is_applied: evaluationModal.value.answers[questionId].is_applied,
        notes: evaluationModal.value.answers[questionId].notes,
      })
    );

    // Submit evaluation
    await axios.post(
      `${API_URL}/workflow/requests/${evaluationModal.value.request.id}/evaluation`,
      { evaluations },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Get the request and action before closing modal
    const request = evaluationModal.value.request;
    const action = evaluationModal.value.nextAction;

    // Update evaluation status
    requestEvaluationStatus.value[request.id] = true;

    // Close modal immediately after successful submission
    closeEvaluationModal();

    showSuccess(t("messages.success.evaluationSubmitted"));

    // Open the appropriate modal for the action if there is one
    if (action) {
      // Add small delay to ensure modal closes before opening next one
      setTimeout(() => {
        openModalForAction(request, action);
      }, 100);
    }

    setTimeout(() => (success.value = null), 5000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to submit evaluation");
    evaluationModal.value.isSaving = false;
  }
};

const openModalForAction = (request, action) => {
  switch (action) {
    case "assign":
      openAssignModal(request);
      break;
    case "details":
      openDetailsModal(request);
      break;
    case "reject":
      openRejectModal(request);
      break;
    case "complete":
      openCompleteModal(request);
      break;
    case "returnPrevious":
      openReturnToPreviousModal(request);
      break;
  }
};

// Helper functions to get latest transition comment
const getLatestTransition = (request) => {
  if (!request.transitions || request.transitions.length === 0) {
    return null;
  }
  // Get the most recent transition with comments
  const transitionsWithComments = request.transitions.filter((t) => t.comments);
  if (transitionsWithComments.length === 0) {
    return null;
  }
  // Sort by created_at descending and get the first one
  return transitionsWithComments.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )[0];
};

const getLatestComment = (request) => {
  const latestTransition = getLatestTransition(request);
  return latestTransition?.comments || null;
};

const getLatestActionLabel = (request) => {
  const latestTransition = getLatestTransition(request);
  if (!latestTransition) return "";

  // Map action types to labels
  const actionLabels = {
    complete: t("workflow.returnedToDeptA"),
    assign: t("workflow.assignedToEmployee"),
    requestDetails: t("workflow.moreDetailsRequested"),
    reject: t("workflow.rejected"),
    submit: t("workflow.submitted"),
  };

  return actionLabels[latestTransition.action] || latestTransition.action;
};
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
  direction: ltr;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-shrink: 0;
}

.view-details-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-4);
}

.idea-type-section,
.idea-category-section {
  margin-bottom: var(--spacing-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.view-details-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: #03735e;
  border: 1px solid #03735e;
  border-radius: var(--radius-lg);
  color: #ffffff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-details-btn:hover {
  background: #025848;
  border-color: #025848;
  color: #ffffff;
}

.view-details-btn svg {
  flex-shrink: 0;
}

.request-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-4);
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

/* Ownership Badge */
.ownership-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border: 1px solid;
  white-space: nowrap;
}

.ownership-badge.individual {
  background: var(--color-blue-50);
  color: var(--color-blue-700);
  border-color: var(--color-blue-300);
}

.ownership-badge.shared {
  background: var(--color-purple-50);
  color: var(--color-purple-700);
  border-color: var(--color-purple-300);
}

/* Idea Type Badge */
.idea-type-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border: 1px solid;
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

/* Benefits Section */
.benefits-section {
  margin-bottom: var(--spacing-5);
}

.benefits-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: 0;
  background: var(--color-green-50);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--color-green-500);
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

/* Employees Section */
.employees-section {
  margin-top: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.employees-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.employees-header svg {
  color: var(--color-primary-600);
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.employee-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.employee-item:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.employee-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-100);
  border-radius: var(--radius-full);
  color: var(--color-primary-600);
  flex-shrink: 0;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
}

.employee-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.employee-detail {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
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

/* File Upload Styles */
.file-upload-area {
  margin-bottom: var(--spacing-4);
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-8);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.file-upload-label:hover:not(.disabled) {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.file-upload-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-upload-label svg {
  color: var(--color-primary-600);
}

.file-upload-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-2);
  text-align: center;
}

.selected-files-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.file-item:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-300);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.file-info svg {
  color: var(--color-primary-600);
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  flex: 1;
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.remove-file-btn {
  padding: var(--spacing-2);
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--radius-md);
  color: var(--color-error-600);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background: var(--color-error-600);
  border-color: var(--color-error-600);
  color: white;
}
</style>
