<template>
  <div class="page-container">
    <div class="page-card">
      <div class="header">
        <button @click="goBack" class="btn-back">{{ $t('common.back') }}</button>
        <h1>{{ $t('workflow.allRequestsTitle') }}</h1>
        <button @click="loadRequests" class="btn-refresh">{{ $t('common.refresh') }}</button>
      </div>

      <p class="subtitle">{{ $t('workflow.allRequestsSubtitle') }}</p>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-if="isLoading" class="loading">
        Loading requests...
      </div>

      <div v-else-if="requests.length === 0" class="empty-state">
        <p>No requests found.</p>
      </div>

      <div v-else class="table-container">
        <table class="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Submitted By</th>
              <th>Workflow Path</th>
              <th>Current Location</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Attachments</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in requests" :key="request.id" class="request-row">
              <td class="id-cell">#{{ request.id }}</td>
              <td class="title-cell">{{ request.title }}</td>
              <td>{{ request.user?.name || 'N/A' }}</td>
              <td>{{ request.workflow_path?.name || 'Not assigned' }}</td>
              <td>{{ request.current_department?.name || 'N/A' }}</td>
              <td>{{ request.current_assignee?.name || 'Unassigned' }}</td>
              <td>
                <span :class="['status-badge', `status-${request.status}`]">
                  {{ formatStatus(request.status) }}
                </span>
              </td>
              <td class="attachments-cell">
                <div v-if="request.attachments && request.attachments.length > 0" class="attachments-list">
                  <a v-for="attachment in request.attachments" :key="attachment.id"
                     :href="`http://localhost:8000/storage/${attachment.file_path}`"
                     target="_blank"
                     class="attachment-link"
                     :title="attachment.file_name">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
                    </svg>
                    <span class="attachment-name">{{ attachment.file_name }}</span>
                  </a>
                </div>
                <span v-else class="no-attachments">—</span>
              </td>
              <td>{{ formatDate(request.updated_at) }}</td>
              <td class="actions-cell">
                <button @click="viewHistory(request.id)" class="btn-view">
                  📋 View History
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const requests = ref([])
const error = ref(null)
const isLoading = ref(true)

const API_URL = 'http://localhost:8000/api'

onMounted(async () => {
  await loadRequests()
})

const loadRequests = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await axios.get(`${API_URL}/workflow/all-requests`, {
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

const goBack = () => {
  router.push('/dashboard')
}

const viewHistory = (requestId) => {
  router.push(`/request-history/${requestId}`)
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
  max-width: 1600px;
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

.table-container {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.requests-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
}

.requests-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.requests-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.requests-table tbody tr:hover {
  background: #f8f9ff;
}

.requests-table td {
  padding: 12px;
  color: #666;
}

.id-cell {
  font-weight: 600;
  color: #667eea;
}

.title-cell {
  font-weight: 500;
  color: #333;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-draft {
  background: #e0e0e0;
  color: #666;
}

.status-pending {
  background: #fff4e6;
  color: #e65100;
}

.status-in_review {
  background: #cfe2ff;
  color: #084298;
}

.status-approved {
  background: #d1e7dd;
  color: #0a3622;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-completed {
  background: #d1e7dd;
  color: #0a3622;
}

.actions-cell {
  text-align: center;
}

.btn-view {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-view:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

/* Attachments Cell */
.attachments-cell {
  max-width: 250px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  text-decoration: none;
  transition: all 0.2s;
}

.attachment-link:hover {
  background: #e8f0ff;
  border-color: #667eea;
  color: #667eea;
}

.attachment-link svg {
  flex-shrink: 0;
}

.attachment-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.no-attachments {
  color: #999;
  font-size: 14px;
}
</style>
