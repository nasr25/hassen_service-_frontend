<template>
  <div class="page-container">
    <div class="page-card">
      <div class="header">
        <button @click="goBack" class="btn-back">← Back to All Requests</button>
        <h1>Request History</h1>
        <button @click="loadRequest" class="btn-refresh">🔄 Refresh</button>
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-if="isLoading" class="loading">
        Loading request details...
      </div>

      <div v-else-if="request" class="request-details">
        <!-- Request Overview -->
        <div class="section">
          <h2>📋 Request Overview</h2>
          <div class="info-grid">
            <div class="info-item">
              <strong>Request ID:</strong>
              <span>#{{ request.id }}</span>
            </div>
            <div class="info-item">
              <strong>Title:</strong>
              <span>{{ request.title }}</span>
            </div>
            <div class="info-item">
              <strong>Submitted By:</strong>
              <span>{{ request.user?.name }}</span>
            </div>
            <div class="info-item">
              <strong>Status:</strong>
              <span :class="['status-badge', `status-${request.status}`]">
                {{ formatStatus(request.status) }}
              </span>
            </div>
            <div class="info-item">
              <strong>Workflow Path:</strong>
              <span>{{ request.workflow_path?.name || 'Not assigned' }}</span>
            </div>
            <div class="info-item">
              <strong>Current Location:</strong>
              <span>{{ request.current_department?.name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <strong>Assigned To:</strong>
              <span>{{ request.current_assignee?.name || 'Unassigned' }}</span>
            </div>
            <div class="info-item">
              <strong>Submitted At:</strong>
              <span>{{ formatDate(request.submitted_at) }}</span>
            </div>
            <div class="info-item info-full">
              <strong>Description:</strong>
              <p class="description">{{ request.description }}</p>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div v-if="request.attachments && request.attachments.length > 0" class="section">
          <h2>📎 Attachments</h2>
          <div class="attachments-list">
            <div v-for="attachment in request.attachments" :key="attachment.id" class="attachment-item">
              <span class="attachment-name">{{ attachment.file_name }}</span>
              <a :href="attachment.file_path" target="_blank" class="btn-download">Download</a>
            </div>
          </div>
        </div>

        <!-- Department A Evaluations -->
        <div v-if="request.evaluations && request.evaluations.length > 0" class="section">
          <h2>📊 Department A Evaluations</h2>
          <div class="evaluations-list">
            <div v-for="evaluation in request.evaluations" :key="evaluation.id" class="evaluation-item">
              <div class="evaluation-question">
                <strong>{{ evaluation.question?.question }}</strong>
                <span class="evaluation-weight">(Weight: {{ evaluation.question?.weight }}%)</span>
              </div>
              <div class="evaluation-score">
                <span class="score-value">Score: {{ evaluation.score }}/10</span>
                <span class="weighted-score">Weighted: {{ (evaluation.score * evaluation.question?.weight / 10).toFixed(1) }}%</span>
              </div>
              <div v-if="evaluation.comments" class="evaluation-comments">
                <em>{{ evaluation.comments }}</em>
              </div>
              <div class="evaluation-meta">
                Evaluated by {{ evaluation.evaluated_by?.name }} on {{ formatDate(evaluation.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Path Evaluations -->
        <div v-if="request.path_evaluations && request.path_evaluations.length > 0" class="section">
          <h2>✅ Path Evaluations</h2>
          <div class="path-evaluations-list">
            <div v-for="pathEval in request.path_evaluations" :key="pathEval.id" class="path-eval-item">
              <div class="path-eval-question">
                <strong>{{ pathEval.question?.question }}</strong>
              </div>
              <div class="path-eval-answer">
                <span :class="['answer-badge', pathEval.is_applied ? 'applied' : 'not-applied']">
                  {{ pathEval.is_applied ? '✓ Applied' : '✗ Not Applied' }}
                </span>
              </div>
              <div v-if="pathEval.notes" class="path-eval-notes">
                <strong>Notes:</strong> {{ pathEval.notes }}
              </div>
              <div class="path-eval-meta">
                Evaluated by {{ pathEval.evaluated_by?.name }} on {{ formatDate(pathEval.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Transition History -->
        <div class="section">
          <h2>🔄 Transition History</h2>
          <div class="timeline">
            <div v-for="(transition, index) in request.transitions" :key="transition.id" class="timeline-item">
              <div class="timeline-marker">{{ request.transitions.length - index }}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span :class="['action-badge', `action-${transition.action}`]">
                    {{ formatAction(transition.action) }}
                  </span>
                  <span class="timeline-date">{{ formatDate(transition.created_at) }}</span>
                </div>
                <div class="timeline-body">
                  <div class="timeline-info">
                    <strong>By:</strong> {{ transition.actioned_by?.name }}
                  </div>
                  <div v-if="transition.from_status || transition.to_status" class="timeline-info">
                    <strong>Status Change:</strong>
                    <span class="status-change">
                      <span v-if="transition.from_status" class="from-status">{{ formatStatus(transition.from_status) }}</span>
                      <span v-if="transition.from_status && transition.to_status"> → </span>
                      <span class="to-status">{{ formatStatus(transition.to_status) }}</span>
                    </span>
                  </div>
                  <div v-if="transition.from_department || transition.to_department" class="timeline-info">
                    <strong>Department:</strong>
                    <span class="status-change">
                      <span v-if="transition.from_department">{{ transition.from_department.name }}</span>
                      <span v-if="transition.from_department && transition.to_department"> → </span>
                      <span v-if="transition.to_department">{{ transition.to_department.name }}</span>
                    </span>
                  </div>
                  <div v-if="transition.to_user" class="timeline-info">
                    <strong>Assigned To:</strong> {{ transition.to_user.name }}
                  </div>
                  <div v-if="transition.comments" class="timeline-comments">
                    <strong>Comments:</strong> {{ transition.comments }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const request = ref(null)
const error = ref(null)
const isLoading = ref(true)

const API_URL = 'http://localhost:8000/api'

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
    error.value = err.response?.data?.message || 'Failed to load request details'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/department-a-requests')
}

const formatStatus = (status) => {
  if (!status) return 'N/A'
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatAction = (action) => {
  if (!action) return 'N/A'
  return action
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

.request-details {
  margin-top: 30px;
}

.section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid #e0e0e0;
}

.section h2 {
  color: #333;
  font-size: 20px;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-item strong {
  display: block;
  color: #555;
  font-size: 13px;
  margin-bottom: 5px;
}

.info-item span, .info-item p {
  color: #333;
  font-size: 14px;
}

.info-full {
  grid-column: 1 / -1;
}

.description {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  display: inline-block;
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

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attachment-name {
  color: #333;
  font-size: 14px;
}

.btn-download {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-download:hover {
  background: #5568d3;
}

.evaluations-list, .path-evaluations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.evaluation-item, .path-eval-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.evaluation-question, .path-eval-question {
  color: #333;
  font-size: 15px;
  margin-bottom: 10px;
}

.evaluation-weight {
  color: #999;
  font-size: 13px;
  font-weight: normal;
  margin-left: 8px;
}

.evaluation-score {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
}

.score-value, .weighted-score {
  padding: 4px 10px;
  background: #e7f5ff;
  color: #1971c2;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.evaluation-comments, .path-eval-notes {
  color: #666;
  font-size: 13px;
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.evaluation-meta, .path-eval-meta {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.path-eval-answer {
  margin-bottom: 10px;
}

.answer-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.answer-badge.applied {
  background: #d1e7dd;
  color: #0a3622;
}

.answer-badge.not-applied {
  background: #f8d7da;
  color: #721c24;
}

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
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  padding-left: 60px;
  padding-bottom: 30px;
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
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.timeline-content {
  background: white;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #e0e0e0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.action-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #e7f5ff;
  color: #1971c2;
}

.timeline-date {
  color: #999;
  font-size: 12px;
}

.timeline-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-info {
  font-size: 14px;
  color: #666;
}

.timeline-info strong {
  color: #333;
  margin-right: 5px;
}

.status-change {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.timeline-comments {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  margin-top: 5px;
}
</style>
