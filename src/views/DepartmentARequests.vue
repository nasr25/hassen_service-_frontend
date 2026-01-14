<template>
  <AppLayout>
    <div class="department-a-requests">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>{{ $t('workflow.allRequestsTitle') }}</h1>
          <p>{{ $t('workflow.allRequestsSubtitle') }}</p>
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

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>{{ $t('messages.loading.requests') }}</p>
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
          <h2>{{ $t('messages.empty.noRequestsFound') }}</h2>
        </div>
      </BaseCard>

      <!-- Requests List -->
      <div v-else>
        <div class="requests-grid">
          <RequestCard
            v-for="request in requests"
            :key="request.id"
            :request="request"
            :show-description="true"
            :show-submitter="true"
            :show-department="true"
            :show-workflow-path="true"
            :show-date="true"
            :show-expected-date="true"
            :show-assigned-to="true"
            :show-attachments="true"
            :show-attachments-list="true"
            :show-latest-comment="true"
          >
            <template #actions>
              <BaseButton
                variant="outline"
                size="sm"
                @click="viewHistory(request.id)"
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
                {{ $t('request.viewHistory') }}
              </BaseButton>
            </template>
          </RequestCard>
        </div>

        <!-- Pagination -->
        <Pagination
          :pagination="pagination"
          @change="goToPage"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAlert } from "../composables/useAlert";
import { useAuthStore } from "../stores/auth";
import axios from "axios";
import AppLayout from "../components/AppLayout.vue";
import BaseCard from "../components/BaseCard.vue";
import BaseButton from "../components/BaseButton.vue";
import BaseBadge from "../components/BaseBadge.vue";
import RequestCard from "../components/RequestCard.vue";
import Pagination from "../components/common/Pagination.vue";
import { API_URL, BASE_URL } from "../config/api";
import TableHeader from "../components/common/TableHeader.vue";
import { httpRequest } from "../services/api";
import { objectToQueryString } from "../services/handle";

const { t } = useI18n();
const { showSuccess, showError, showConfirm, showDeleteConfirm } = useAlert();
const router = useRouter();
const authStore = useAuthStore();

const requests = ref([]);
const error = ref(null);
const isLoading = ref(true);

// Pagination state
const pagination = ref({
  total: 0,
  per_page: 12,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
});

onMounted(async () => {
  await loadRequests();
});

const loadRequests = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
    };
    let queryString = objectToQueryString(params);

    const response = await httpRequest(`/workflow/all-requests?${queryString}`);

    requests.value = response.data.requests;

    // Update pagination state
    if (response.data.pagination) {
      pagination.value = response.data.pagination;
    }
  } catch (err) {
    showError(
      err.response?.data?.message || t("messages.error.failedToLoadRequests")
    );
  } finally {
    isLoading.value = false;
  }
};

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page;
    loadRequests();
  }
};

const viewHistory = (requestId) => {
  router.push(`/requests/${requestId}`);
};

const getStatusVariant = (status) => {
  const variants = {
    draft: "gray",
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

const formatDate = (dateString) => {
  if (!dateString) return t("common.notAvailable");
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
