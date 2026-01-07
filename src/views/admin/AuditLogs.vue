<template>
  <AppLayout>
    <div class="audit-logs">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>📜 {{ $t('audit.title') }}</h1>
          <p class="page-subtitle">{{ $t('audit.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <button @click="refresh" class="btn-refresh">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
            </svg>
            {{ $t('common.refresh') }}
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

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
            <select v-model="filters.action" @change="fetchLogs" class="form-select">
              <option value="">{{ $t('audit.allActions') }}</option>
              <option v-for="action in availableActions" :key="action" :value="action">
                {{ formatAction(action) }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label>{{ $t('audit.modelType') }}</label>
            <select v-model="filters.model_type" @change="fetchLogs" class="form-select">
              <option value="">{{ $t('audit.allModels') }}</option>
              <option v-for="model in availableModelTypes" :key="model" :value="model">
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

          <div class="filter-item" style="margin-top: 29px;">
            <button @click="clearFilters" class="btn-secondary">
              {{ $t('audit.clearFilters') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>

      <!-- Logs Table -->
      <div v-else class="logs-container">
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
              <tr v-for="log in logs" :key="log.id">
                <td>
                  <div class="timestamp">
                    <div>{{ formatDate(log.created_at) }}</div>
                    <div class="time">{{ formatTime(log.created_at) }}</div>
                  </div>
                </td>
                <td>
                  <div v-if="log.user" class="user-info">
                    <strong>{{ log.user.name }}</strong>
                    <div class="user-email">{{ log.user.email }}</div>
                  </div>
                  <span v-else class="text-muted">{{ $t('audit.systemAction') }}</span>
                </td>
                <td>
                  <span :class="['action-badge', `action-${log.action}`]">
                    {{ formatAction(log.action) }}
                  </span>
                </td>
                <td>
                  <div v-if="log.model_type" class="model-info">
                    <div>{{ formatModelType(log.model_type) }}</div>
                    <div v-if="log.model_id" class="model-id">ID: {{ log.model_id }}</div>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div class="description">{{ log.description || '-' }}</div>
                </td>
                <td>
                  <code class="ip-address">{{ log.ip_address || '-' }}</code>
                </td>
                <td>
                  <button @click="viewDetails(log)" class="btn-icon" :title="$t('audit.viewDetails')">
                    👁️
                  </button>
                </td>
              </tr>
              <tr v-if="logs.length === 0">
                <td colspan="7" class="text-center text-muted">
                  {{ $t('audit.noLogsFound') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="btn-pagination"
          >
            {{ $t('common.previous') }}
          </button>

          <span class="pagination-info">
            {{ $t('audit.page') }} {{ pagination.current_page }} {{ $t('audit.of') }} {{ pagination.last_page }}
            ({{ $t('audit.total') }}: {{ pagination.total }})
          </span>

          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="btn-pagination"
          >
            {{ $t('common.next') }}
          </button>
        </div>
      </div>

      <!-- Details Modal -->
      <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
        <div class="modal-content modal-large" @click.stop>
          <div class="modal-header">
            <h2>{{ $t('audit.logDetails') }}</h2>
            <button @click="closeDetailsModal" class="btn-close">×</button>
          </div>

          <div class="modal-body">
            <div v-if="selectedLog" class="details-grid">
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

              <div v-if="selectedLog.old_values" class="detail-item full-width">
                <label>{{ $t('audit.oldValues') }}</label>
                <pre class="json-view">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
              </div>

              <div v-if="selectedLog.new_values" class="detail-item full-width">
                <label>{{ $t('audit.newValues') }}</label>
                <pre class="json-view">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeDetailsModal" class="btn-secondary">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import AppLayout from '../../components/AppLayout.vue'
import { API_URL } from '../../config/api'
import { useAlert } from '../composables/useAlert'

const { t } = useI18n()
const { showSuccess, showError, showConfirm, showDeleteConfirm } = useAlert()
const authStore = useAuthStore()

const logs = ref([])
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const filters = ref({
  search: '',
  action: '',
  model_type: '',
  date_from: '',
  date_to: '',
  per_page: 20,
})

const pagination = ref({
  total: 0,
  per_page: 20,
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
})

const availableActions = ref([])
const availableModelTypes = ref([])

const showDetailsModal = ref(false)
const selectedLog = ref(null)

let debounceTimeout = null

// Methods
const fetchLogs = async (page = 1) => {
  isLoading.value = true
  error.value = ''

  try {
    const params = {
      ...filters.value,
      page
    }

    const response = await axios.get(`${API_URL}/audit-logs`, {
      params,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    logs.value = response.data.logs || []
    pagination.value = response.data.pagination || {}
  } catch (err) {
    showError(err.response?.data?.message || t('messages.error.failedToFetch'))
  } finally {
    isLoading.value = false
  }
}

const fetchFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/audit-logs/filters`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    availableActions.value = response.data.actions || []
    availableModelTypes.value = response.data.model_types || []
  } catch (err) {
    console.error('Failed to fetch filters:', err)
  }
}

const debouncedFetch = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    fetchLogs()
  }, 500)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    action: '',
    model_type: '',
    date_from: '',
    date_to: '',
    per_page: 20,
  }
  fetchLogs()
}

const refresh = () => {
  fetchLogs(pagination.value.current_page)
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchLogs(page)
  }
}

const viewDetails = (log) => {
  selectedLog.value = log
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedLog.value = null
}

const formatAction = (action) => {
  if (!action) return '-'
  const key = `audit.actions.${action}`
  const translated = t(key)
  return translated !== key ? translated : action.replace(/_/g, ' ').toUpperCase()
}

const formatModelType = (modelType) => {
  if (!modelType) return '-'
  return modelType.replace('App\\Models\\', '')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString()
}

onMounted(() => {
  fetchLogs()
  fetchFilters()
})
</script>

<style scoped>
.audit-logs {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: var(--color-text-secondary, #666);
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary, #02735E);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: var(--color-primary-dark, #015a4a);
  transform: translateY(-1px);
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.alert-success {
  background: #efe;
  color: #060;
  border: 1px solid #cfc;
}

.filters-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-item label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #1a1a1a);
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary, #02735E);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.btn-secondary {
  width: 100%;
  padding: 10px 20px;
  background: #f3f4f6;
  color: var(--color-text-primary, #1a1a1a);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #666);
  font-size: 16px;
}

.logs-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table thead {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.logs-table th {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #1a1a1a);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.logs-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  text-align: center;
}

.logs-table tbody tr:hover {
  background: #f9fafb;
}

.timestamp {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-email {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}

.action-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.action-created {
  background: #dbeafe;
  color: #1e40af;
}

.action-updated {
  background: #fef3c7;
  color: #92400e;
}

.action-deleted {
  background: #fee2e2;
  color: #991b1b;
}

.action-logged_in {
  background: #d1fae5;
  color: #065f46;
}

.action-logged_out {
  background: #f3f4f6;
  color: #374151;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-id {
  font-size: 11px;
  color: var(--color-text-secondary, #666);
  font-family: monospace;
}

.description {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ip-address {
  font-family: monospace;
  font-size: 13px;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-icon {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f9fafb;
  transform: scale(1.05);
}

.text-center {
  text-align: center;
}

.text-muted {
  color: var(--color-text-secondary, #666);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-pagination {
  padding: 8px 16px;
  background: var(--color-primary, #02735E);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-pagination:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-pagination:not(:disabled):hover {
  background: var(--color-primary-dark, #015a4a);
}

.pagination-info {
  font-size: 14px;
  color: var(--color-text-secondary, #666);
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: var(--color-text-secondary, #666);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.method-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.url-code {
  font-family: monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 8px;
  border-radius: 6px;
  word-break: break-all;
}

.user-agent {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
  line-height: 1.5;
}

.json-view {
  background: #1f2937;
  color: #02735E;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  overflow-x: auto;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: 1;
  }

  .logs-table {
    font-size: 13px;
  }

  .logs-table th,
  .logs-table td {
    padding: 12px 8px;
  }
}
</style>
