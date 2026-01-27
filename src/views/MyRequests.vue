<template>
  <AppLayout>
    <div class="my-requests">
      <!-- Header Actions -->
      <div class="page-header">
        <TableHeader
          :title="$t('nav.myIdeas')  "
          :breadcrumbs="pageBreadcrumbs"
        />

        <div class="header-actions">
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
          <BaseButton
            variant="primary"
            @click="createNew"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clip-rule="evenodd"
              />
            </svg>
            {{ $t('request.newIdea') }}
          </BaseButton>
        </div>
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
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Filter Bar (Always Visible) -->
      <div
        v-else
        class="filter-bar"
        :dir="t('dir')"
      >
        <button
          v-for="status in statuses"
          :key="status.value"
          @click="onFilterChange(status.value)"
          :class="['filter-chip', { active: filterStatus === status.value }]"
        >
          {{ status.label }}
          <span
            v-if="statusCounts[status.value] !== undefined"
            class="count"
          >
            {{ statusCounts[status.value] }}
          </span>
        </button>
      </div>

      <!-- Empty State -->
      <BaseCard
        v-if="!isLoading && requests.length === 0"
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2>{{ getEmptyStateTitle() }}</h2>
          <p>{{ getEmptyStateMessage() }}</p>
          <BaseButton
            v-if="filterStatus === 'all'"
            variant="primary"
            size="lg"
            @click="createNew"
          >
            {{ $t('request.newIdea') }}
          </BaseButton>
          <BaseButton
            v-else
            variant="secondary"
            size="lg"
            @click="onFilterChange('all')"
          >
            {{ $t('common.viewAll') }}
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Requests Grid -->
      <div
        v-if="!isLoading && requests.length > 0"
        class="requests-grid"
      >
          <RequestCard
            v-for="request in requests"
            :key="request.id"
            :request="request"
            :clickable="true"
            :show-description="true"
            :truncate-description="true"
            :description-length="120"
            :show-submitter="false"
            :show-department="true"
            :show-date="true"
            :show-expected-date="true"
            :show-attachments="true"
            :show-attachments-list="true"
            @click="viewDetails(request.id)"
          >
            <template #actions>
              <button
                v-if="request.status === 'draft' || request.status === 'need_more_details'"
                class="edit-btn"
                @click.stop="editRequest(request.id)"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {{ $t('common.edit') }}
              </button>
              <button
                class="view-btn"
                @click.stop="viewDetails(request.id)"
              >
                {{ $t('request.viewDetails') }}
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </template>
          </RequestCard>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="!isLoading && requests.length > 0"
        :pagination="pagination"
        @change="goToPage"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";
import axios from "axios";
import AppLayout from "../components/AppLayout.vue";
import BaseCard from "../components/BaseCard.vue";
import BaseButton from "../components/BaseButton.vue";
import BaseBadge from "../components/BaseBadge.vue";
import RequestCard from "../components/RequestCard.vue";
import Pagination from "../components/common/Pagination.vue";
import { useAlert } from "../composables/useAlert";
import TableHeader from "../components/common/TableHeader.vue";
import { httpRequest } from "../services/api";
import { objectToQueryString } from "../services/handle";
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const { showSuccess, showError } = useAlert();

const requests = ref([]);
const error = ref(null);
const isLoading = ref(true);
const filterStatus = ref("all");
const statusCounts = ref({
  all: 0,
  draft: 0,
  pending: 0,
  in_review: 0,
  need_more_details: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
});
const pageBreadcrumbs = computed(() => [
  { name: t("nav.dashboard"), link: "/" },
  { name: t("nav.myIdeas"), link: "/requests" },
]);
// Pagination state
const pagination = ref({
  total: 0,
  per_page: 12,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
});

import { API_URL, BASE_URL } from "../config/api";

const statuses = computed(() => [
  { label: t("common.all"), value: "all" },
  { label: t("status.draft"), value: "draft" },
  { label: t("status.pending"), value: "pending" },
  { label: t("status.in_review"), value: "in_review" },
  { label: t("status.need_more_details"), value: "need_more_details" },
  { label: t("status.approved"), value: "approved" },
  { label: t("status.rejected"), value: "rejected" },
  { label: t("status.completed"), value: "completed" },
]);

// Watch for filter changes
const onFilterChange = (status) => {
  filterStatus.value = status;
  pagination.value.current_page = 1;
  loadRequests();
};

onMounted(async () => {
  await loadRequests();
});

const loadRequests = async () => {
  try {
    isLoading.value = true;

    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
    };

    // Add status filter if not 'all'
    if (filterStatus.value !== "all") {
      params.status = filterStatus.value;
    }

    let queryString = objectToQueryString(params);
    const response = await httpRequest(`/requests?${queryString}`);

    requests.value = response.data.requests;

    // Update pagination state
    if (response.data.pagination) {
      pagination.value = response.data.pagination;
    }

    // Update status counts from the response
    if (response.data.status_counts) {
      statusCounts.value = response.data.status_counts;
    }
  } catch (err) {
    console.error("Failed to load requests:", err);
    showError(
      err.response?.data?.message || err.message || "Failed to load requests"
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

const createNew = () => {
  router.push("/requests/new");
};

const editRequest = (id) => {
  router.push(`/requests/${id}/edit`);
};

const viewDetails = (id) => {
  router.push(`/requests/${id}`);
};

const getEmptyStateTitle = () => {
  if (filterStatus.value === 'all') {
    return t('request.noRequests');
  }
  return t('request.noRequestsWithFilter', { status: t(`status.${filterStatus.value}`) });
};

const getEmptyStateMessage = () => {
  if (filterStatus.value === 'all') {
    return t('request.noRequestsMessage');
  }
  return t('request.noRequestsWithFilterMessage', { status: t(`status.${filterStatus.value}`).toLowerCase() });
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

const formatStatus = (status) => {
  return t(`status.${status}`);
};

const formatDate = (dateString) => {
  if (!dateString) return t("common.notAvailable");
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const truncate = (text, length) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};
</script>

<style scoped>
.my-requests {
  max-width: 1440px;
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

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
  width: 100%;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary-600);
  border: 1px solid var(--color-primary-600);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
}

.edit-btn:hover {
  background: var(--color-primary-700);
  border-color: var(--color-primary-700);
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
  flex: 1;
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
