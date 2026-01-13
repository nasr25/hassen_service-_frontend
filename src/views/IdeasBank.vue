<template>
  <AppLayout>
    <div class="ideas-bank">
      <!-- Header -->
      <div class="page-header">
        <h1>{{ $t('ideasBank.title') }}</h1>
        <p class="subtitle">{{ $t('ideasBank.subtitle') }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" :class="{ active: filter === 'all' }" @click="setFilter('all')">
          <div class="stat-icon total">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">{{ $t('ideasBank.stats.total') }}</span>
          </div>
        </div>

        <div class="stat-card" :class="{ active: filter === 'under_review' }" @click="setFilter('under_review')">
          <div class="stat-icon under-review">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.under_review }}</span>
            <span class="stat-label">{{ $t('ideasBank.stats.underReview') }}</span>
          </div>
        </div>

        <div class="stat-card" :class="{ active: filter === 'in_progress' }" @click="setFilter('in_progress')">
          <div class="stat-icon in-progress">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.in_progress }}</span>
            <span class="stat-label">{{ $t('ideasBank.stats.inProgress') }}</span>
          </div>
        </div>

        <div class="stat-card" :class="{ active: filter === 'completed' }" @click="setFilter('completed')">
          <div class="stat-icon completed">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">{{ $t('ideasBank.stats.completed') }}</span>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-box">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            v-model="search"
            :placeholder="$t('ideasBank.searchPlaceholder')"
            @input="debouncedSearch"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Ideas Grid -->
      <div v-else-if="ideas.length > 0" class="ideas-grid">
        <div v-for="idea in ideas" :key="idea.id" class="idea-card">
          <div class="idea-header">
            <span
              class="idea-type-badge"
              :style="{ backgroundColor: idea.idea_type?.color || '#6b7280' }"
            >
              {{ getIdeaTypeName(idea.idea_type) }}
            </span>
            <span class="idea-status" :class="getStatusClass(idea.status)">
              {{ $t(`ideasBank.status.${idea.status}`) }}
            </span>
          </div>

          <h3 class="idea-title">{{ idea.title }}</h3>
          <p class="idea-description">{{ truncateText(idea.description, 120) }}</p>

          <div class="idea-meta">
            <div class="meta-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <span>{{ idea.user?.username || $t('common.unknown') }}</span>
            </div>
            <div class="meta-item" v-if="idea.department">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
              </svg>
              <span>{{ idea.department?.name }}</span>
            </div>
          </div>

          <div class="idea-footer" v-if="idea.current_assignee">
            <div class="assignee">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span>{{ $t('ideasBank.assignedTo') }}: {{ idea.current_assignee?.username }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
        <h3>{{ $t('ideasBank.noIdeas') }}</h3>
        <p>{{ $t('ideasBank.noIdeasDescription') }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="ideas.length > 0" class="pagination">
        <div class="pagination-info-left">
          {{ $t('ideasBank.showing') }}
          <strong>{{ ((pagination.current_page - 1) * pagination.per_page) + 1 }}</strong>
          {{ $t('common.to') }}
          <strong>{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</strong>
          {{ $t('common.of') }}
          <strong>{{ pagination.total }}</strong>
          {{ $t('ideasBank.results') }}
        </div>
        <div class="pagination-controls">
          <button
            class="btn-pagination"
            :disabled="pagination.current_page === 1"
            @click="goToPage(pagination.current_page - 1)"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {{ $t('common.previous') }}
          </button>
          <span class="pagination-pages">
            {{ $t('common.page') }} {{ pagination.current_page }} {{ $t('common.of') }} {{ pagination.last_page }}
          </span>
          <button
            class="btn-pagination"
            :disabled="pagination.current_page === pagination.last_page"
            @click="goToPage(pagination.current_page + 1)"
          >
            {{ $t('common.next') }}
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { API_URL } from '../config/api'
import AppLayout from '../components/AppLayout.vue'

const { locale } = useI18n()
const authStore = useAuthStore()

const ideas = ref([])
const isLoading = ref(false)
const search = ref('')
const filter = ref('all')
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0
})
const stats = ref({
  total: 0,
  under_review: 0,
  in_progress: 0,
  completed: 0
})

let searchTimeout = null

const fetchIdeas = async (page = 1) => {
  isLoading.value = true
  try {
    const params = {
      page,
      per_page: pagination.value.per_page,
      search: search.value,
      filter: filter.value
    }

    const response = await axios.get(`${API_URL}/ideas-bank`, {
      params,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    ideas.value = response.data.ideas
    pagination.value = response.data.pagination
    stats.value = response.data.stats
  } catch (error) {
    console.error('Failed to fetch ideas:', error)
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchIdeas(1)
  }, 500)
}

const setFilter = (newFilter) => {
  filter.value = newFilter
  fetchIdeas(1)
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchIdeas(page)
  }
}

const getIdeaTypeName = (ideaType) => {
  if (!ideaType) return ''
  return locale.value === 'ar' ? ideaType.name_ar : ideaType.name
}

const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'under_review': 'status-under-review',
    'in_progress': 'status-in-progress',
    'completed': 'status-completed'
  }
  return classes[status] || 'status-pending'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  fetchIdeas()
})
</script>

<style scoped>
.ideas-bank {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.active {
  border-color: #02735E;
  background: #f0fdf4;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #02735E, #015a4a);
}

.stat-icon.under-review {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.in-progress {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* Search Section */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  max-width: 400px;
}

.search-box svg {
  color: #9ca3af;
  margin-right: 12px;
}

[dir="rtl"] .search-box svg {
  margin-right: 0;
  margin-left: 12px;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1f2937;
  background: transparent;
}

.search-box input::placeholder {
  color: #9ca3af;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #02735E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Ideas Grid */
.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.idea-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.idea-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.idea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.idea-type-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.idea-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-under-review {
  background: #fef3c7;
  color: #92400e;
}

.status-in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.idea-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.idea-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.6;
  flex: 1;
}

.idea-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.meta-item svg {
  color: #9ca3af;
}

.idea-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #02735E;
  font-weight: 500;
}

.assignee svg {
  color: #02735E;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  text-align: center;
  background: white;
  border-radius: 12px;
  color: #6b7280;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}

.pagination-info-left {
  font-size: 14px;
  color: #6b7280;
}

.pagination-info-left strong {
  color: #1f2937;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #02735E;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-pagination:hover:not(:disabled) {
  background: #015a4a;
}

.btn-pagination:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-pages {
  font-size: 14px;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .ideas-grid {
    grid-template-columns: 1fr;
  }

  .search-box {
    max-width: 100%;
  }
}

/* RTL Support */
[dir="rtl"] .idea-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .meta-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .assignee {
  flex-direction: row-reverse;
}

[dir="rtl"] .stat-card {
  flex-direction: row-reverse;
}

[dir="rtl"] .stat-content {
  text-align: right;
}

[dir="rtl"] .pagination {
  flex-direction: row-reverse;
}

[dir="rtl"] .pagination-controls {
  flex-direction: row-reverse;
}

[dir="rtl"] .btn-pagination {
  flex-direction: row-reverse;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 16px;
  }

  .pagination-info-left {
    text-align: center;
  }

  [dir="rtl"] .pagination {
    flex-direction: column;
  }
}
</style>
