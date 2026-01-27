<template>
  <AppLayout>
    <div class="audit-logs">
      <!-- Header -->
      <div class="page-header">

        <TableHeader
          title="System Users"
          description="Manage all registered users and their permissions."
          :breadcrumbs="pageBreadcrumbs"
        />

        <div class="header-actions">
          <button
            @click="refresh"
            class="btn-refresh"
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
            <b> {{ $t('common.refresh') }}</b>

          </button>
        </div>

      </div>

      <!-- Alerts -->
      <div
        v-if="error"
        class="alert alert-error"
      >{{ error }}</div>
      <div
        v-if="success"
        class="alert alert-success"
      >{{ success }}</div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-item">
            <label>{{ $t('audit.search') }}</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-input"
              :placeholder="$t('audit.searchPlaceholder')"
              @input="debouncedFetch"
            />
          </div>

          <div class="filter-item">
            <label>{{ $t('audit.action') }}</label>
            <select
              v-model="filters.action"
              @change="fetchLogs"
              class="form-select"
            >
              <option value="">{{ $t('audit.allActions') }}</option>
              <option
                v-for="action in availableActions"
                :key="action"
                :value="action"
              >
                {{ formatAction(action) }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label>{{ $t('audit.modelType') }}</label>
            <select
              v-model="filters.model_type"
              @change="fetchLogs"
              class="form-select"
            >
              <option value="">{{ $t('audit.allModels') }}</option>
              <option
                v-for="model in availableModelTypes"
                :key="model"
                :value="model"
              >
                {{ formatModelType(model) }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label>{{ $t('audit.dateFrom') }}</label>
            <input
              v-model="filters.date_from"
              type="date"
              class="form-input"
              @change="fetchLogs"
            />
          </div>

          <div class="filter-item">
            <label>{{ $t('audit.dateTo') }}</label>
            <input
              v-model="filters.date_to"
              type="date"
              class="form-input"
              @change="fetchLogs"
            />
          </div>

          <div
            class="filter-item"
            style="margin-top: 29px;"
          >
            <button
              @click="clearFilters"
              class="btn-secondary"
            >
              {{ $t('audit.clearFilters') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="loading"
      >{{ $t('common.loading') }}</div>

      <!-- Logs Table -->
      <div
        v-else
        class="logs-container"
      >
        <div class="table-container">
          <table class="logs-table">
            <thead>
              <tr>
                <th>{{ $t('audit.timestamp') }}</th>
                <th>{{ $t('audit.user') }}</th>
                <th>{{ $t('audit.action') }}</th>
                <th>{{ $t('audit.model') }}</th>
                <th>{{ $t('audit.description') }}</th>
                <th>{{ $t('audit.ipAddress') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in logs"
                :key="log.id"
              >
                <td>
                  <div class="timestamp">
                    <div>{{ formatDate(log.created_at) }}</div>
                    <div class="time">{{ formatTime(log.created_at) }}</div>
                  </div>
                </td>
                <td>
                  <div
                    v-if="log.user"
                    class="user-info"
                  >
                    <strong>{{ log.user.name }}</strong>
                    <div class="user-email">{{ log.user.email }}</div>
                  </div>
                  <span
                    v-else
                    class="text-muted"
                  >{{ $t('audit.systemAction') }}</span>
                </td>
                <td>
                  <span :class="['action-badge', `action-${log.action}`]">
                    {{ formatAction(log.action) }}
                  </span>
                </td>
                <td>
                  <div
                    v-if="log.model_type"
                    class="model-info"
                  >
                    <div>{{ formatModelType(log.model_type) }}</div>
                    <div
                      v-if="log.model_id"
                      class="model-id"
                    >ID: {{ log.model_id }}</div>
                  </div>
                  <span
                    v-else
                    class="text-muted"
                  >-</span>
                </td>
                <td>
                  <div class="description">{{ log.description || '-' }}</div>
                </td>
                <td>
                  <code class="ip-address">{{ log.ip_address || '-' }}</code>
                </td>
                <td>
                  <button
                    @click="viewDetails(log)"
                    class="btn-icon"
                    :title="$t('audit.viewDetails')"
                  >
                    👁️
                  </button>
                </td>
              </tr>
              <tr v-if="logs.length === 0">
                <td
                  colspan="7"
                  class="text-center text-muted"
                >
                  {{ $t('audit.noLogsFound') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <Pagination
          :pagination="pagination"
          @change="goToPage"
        />
      </div>
      <!---end end pagination  !-->
      <!-- Details Modal -->
      <div
        v-if="showDetailsModal"
        class="modal-overlay"
        @click="closeDetailsModal"
      >
        <div
          class="modal-content modal-large"
          @click.stop
        >
          <div class="modal-header">
            <h2>{{ $t('audit.logDetails') }}</h2>
            <button
              @click="closeDetailsModal"
              class="btn-close"
            >×</button>
          </div>

          <div class="modal-body">
            <div
              v-if="selectedLog"
              class="details-grid"
            >
              <div class="detail-item">
                <label>{{ $t('audit.timestamp') }}</label>
                <div>{{ formatDateTime(selectedLog.created_at) }}</div>
              </div>

              <div class="detail-item">
                <label>{{ $t('audit.user') }}</label>
                <div v-if="selectedLog.user">
                  {{ selectedLog.user.name }} ({{ selectedLog.user.email }})
                </div>
                <div v-else>{{ $t('audit.systemAction') }}</div>
              </div>

              <div class="detail-item">
                <label>{{ $t('audit.action') }}</label>
                <span :class="['action-badge', `action-${selectedLog.action}`]">
                  {{ formatAction(selectedLog.action) }}
                </span>
              </div>

              <div class="detail-item">
                <label>{{ $t('audit.model') }}</label>
                <div>
                  {{ formatModelType(selectedLog.model_type) }}
                  <span v-if="selectedLog.model_id">(ID: {{ selectedLog.model_id }})</span>
                </div>
              </div>

              <div class="detail-item full-width">
                <label>{{ $t('audit.description') }}</label>
                <div>{{ selectedLog.description || '-' }}</div>
              </div>

              <div class="detail-item">
                <label>{{ $t('audit.ipAddress') }}</label>
                <code>{{ selectedLog.ip_address || '-' }}</code>
              </div>

              <div class="detail-item">
                <label>{{ $t('audit.method') }}</label>
                <span class="method-badge">{{ selectedLog.method || '-' }}</span>
              </div>

              <div class="detail-item full-width">
                <label>{{ $t('audit.url') }}</label>
                <code class="url-code">{{ selectedLog.url || '-' }}</code>
              </div>

              <div class="detail-item full-width">
                <label>{{ $t('audit.userAgent') }}</label>
                <div class="user-agent">{{ selectedLog.user_agent || '-' }}</div>
              </div>

              <div
                v-if="selectedLog.old_values"
                class="detail-item full-width"
              >
                <label>{{ $t('audit.oldValues') }}</label>
                <pre class="json-view">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
              </div>

              <div
                v-if="selectedLog.new_values"
                class="detail-item full-width"
              >
                <label>{{ $t('audit.newValues') }}</label>
                <pre class="json-view">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              @click="closeDetailsModal"
              class="btn-secondary"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth";
import AppLayout from "../../components/AppLayout.vue";
// 1. Import the component (assuming you named it TableHeader.vue)
import TableHeader from "../../components/common/TableHeader.vue";
import Pagination from "../../components/common/Pagination.vue";
import { objectToQueryString } from "../../services/handle";
import { httpRequest } from "../../services/api";
// 2. Define the data for the breadcrumbs and title
const pageBreadcrumbs = computed(() => [
  { name: t("nav.dashboard"), link: "/" },
  { name: t("admin.auditLogs"), link: "/admin/audit-logs" },
]);

const { t } = useI18n();
const authStore = useAuthStore();

const logs = ref([]);
const isLoading = ref(false);
const error = ref("");
const success = ref("");

const filters = ref({
  search: "",
  action: "",
  model_type: "",
  date_from: "",
  date_to: "",
  per_page: 10,
});

const pagination = ref({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
});

const availableActions = ref([]);
const availableModelTypes = ref([]);

const showDetailsModal = ref(false);
const selectedLog = ref(null);

let debounceTimeout = null;

// Methods
const fetchLogs = async (page = 1) => {
  isLoading.value = true;
  error.value = "";

  try {
    const params = {
      ...filters.value,
      page,
    };
    let queryString = "";
    queryString = objectToQueryString(params);
    const response = await httpRequest(`/audit-logs?${queryString}`);

    logs.value = response.data.logs || [];
    pagination.value = response.data.pagination || {};
  } catch (err) {
    error.value =
      err.response?.data?.message || t("messages.error.failedToFetch");
  } finally {
    isLoading.value = false;
  }
};

const fetchFilters = async () => {
  try {
    const response = await httpRequest(`/audit-logs?`);

    availableActions.value = response.data.actions || [];
    availableModelTypes.value = response.data.model_types || [];
  } catch (err) {
    console.error("Failed to fetch filters:", err);
  }
};

const debouncedFetch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchLogs();
  }, 500);
};

const clearFilters = () => {
  filters.value = {
    search: "",
    action: "",
    model_type: "",
    date_from: "",
    date_to: "",
    per_page: 20,
  };
  fetchLogs();
};

const refresh = () => {
  fetchLogs(pagination.value.current_page);
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchLogs(page);
  }
};

const viewDetails = (log) => {
  selectedLog.value = log;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedLog.value = null;
};

const formatAction = (action) => {
  if (!action) return "-";
  const key = `audit.actions.${action}`;
  const translated = t(key);
  return translated !== key
    ? translated
    : action.replace(/_/g, " ").toUpperCase();
};

const formatModelType = (modelType) => {
  if (!modelType) return "-";
  return modelType.replace("App\\Models\\", "");
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString();
};

onMounted(() => {
  fetchLogs();
  fetchFilters();
});
</script>


