<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div>
          <h1>{{ $t('common.welcome') }}, {{ user?.name }}!</h1>
          <p class="welcome-subtitle">{{ $t('dashboard.subtitle') }}</p>
        </div>
        <BaseBadge :variant="getRoleBadgeVariant(user?.role)" class="role-badge-large">
          {{ user?.role }}
        </BaseBadge>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <BaseCard class="stat-card">
          <div class="stat-icon stat-icon-primary">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalRequests }}</div>
            <div class="stat-label">Total Requests</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card">
          <div class="stat-icon stat-icon-warning">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingRequests }}</div>
            <div class="stat-label">Pending Requests</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card">
          <div class="stat-icon stat-icon-success">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.approvedRequests }}</div>
            <div class="stat-label">Approved</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card">
          <div class="stat-icon stat-icon-error">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.rejectedRequests }}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </BaseCard>
      </div>

      <!-- Quick Actions -->
      <div class="section-header">
        <h2>Quick Actions</h2>
        <p>Access frequently used features</p>
      </div>

      <div class="actions-grid">
        <BaseCard v-if="canViewOwnRequests" class="action-card" @click="goToRequests">
          <div class="action-icon action-icon-primary">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3>{{ $t('dashboard.myRequests.title') }}</h3>
          <p>{{ $t('dashboard.myRequests.description') }}</p>
        </BaseCard>

        <BaseCard v-if="canCreateRequest" class="action-card" @click="goToNewRequest">
          <div class="action-icon action-icon-success">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3>{{ $t('dashboard.newRequest.title') }}</h3>
          <p>{{ $t('dashboard.newRequest.description') }}</p>
        </BaseCard>

        <BaseCard v-if="canViewWorkflow" class="action-card" @click="goToWorkflowReview">
          <div class="action-icon action-icon-warning">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3>{{ $t('dashboard.reviewRequests.title') }}</h3>
          <p>{{ $t('dashboard.reviewRequests.description') }}</p>
        </BaseCard>

        <BaseCard v-if="canViewDepartment" class="action-card" @click="goDepartmentWorkflow">
          <div class="action-icon action-icon-info">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
          <h3>{{ $t('dashboard.departmentWorkflow.title') }}</h3>
          <p>{{ $t('dashboard.departmentWorkflow.description') }}</p>
        </BaseCard>

        <BaseCard v-if="canAccessAdmin" class="action-card" @click="goToAdmin">
          <div class="action-icon action-icon-secondary">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3>{{ $t('dashboard.adminPanel.title') }}</h3>
          <p>{{ $t('dashboard.adminPanel.description') }}</p>
        </BaseCard>
      </div>

      <!-- Recent Activity -->
      <div class="section-header">
        <h2>Recent Activity</h2>
        <p>Your latest workflow activities</p>
      </div>

      <BaseCard class="activity-card">
        <div v-if="recentActivity.length === 0" class="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3>No recent activity</h3>
          <p>Start by creating your first request</p>
          <BaseButton v-if="canCreateRequest" variant="primary" @click="goToNewRequest">
            Create Request
          </BaseButton>
        </div>

        <div v-else class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="`activity-icon-${activity.type}`">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="6"/>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
            <BaseBadge :variant="activity.badgeVariant">{{ activity.status }}</BaseBadge>
          </div>
        </div>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseBadge from '../components/BaseBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

// Mock stats data (replace with actual API calls)
const stats = ref({
  totalRequests: 24,
  pendingRequests: 5,
  approvedRequests: 16,
  rejectedRequests: 3
})

// Mock recent activity (replace with actual API calls)
const recentActivity = ref([])

// Permission-based access control
const canViewOwnRequests = computed(() =>
  authStore.hasPermission('request.view-own') || authStore.hasPermission('request.view-all')
)

const canCreateRequest = computed(() =>
  authStore.hasPermission('request.create')
)

const canViewWorkflow = computed(() =>
  authStore.hasAnyPermission(['workflow.view-pending', 'workflow.assign-path'])
)

const canViewDepartment = computed(() =>
  authStore.hasAnyPermission(['department.view-requests', 'department.assign-employee'])
)

const canAccessAdmin = computed(() =>
  authStore.hasAnyPermission(['user.view', 'department.view', 'role.view'])
)

const getRoleBadgeVariant = (role) => {
  const variants = {
    'Admin': 'error',
    'Manager': 'warning',
    'User': 'primary',
    'Employee': 'info'
  }
  return variants[role] || 'gray'
}

// Navigation methods
const goToRequests = () => {
  router.push('/requests')
}

const goToNewRequest = () => {
  router.push('/requests/new')
}

const goToWorkflowReview = () => {
  router.push('/workflow/review')
}

const goDepartmentWorkflow = () => {
  router.push('/department/workflow')
}

const goToAdmin = () => {
  router.push('/admin')
}
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-secondary-600) 100%);
  border-radius: var(--radius-2xl);
  color: white;
}

.welcome-section h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-2);
  color: white;
}

.welcome-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.95;
  margin: 0;
  color: white;
}

.role-badge-large {
  font-size: var(--font-size-base);
  padding: var(--spacing-2) var(--spacing-6);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-10);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  cursor: default;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: var(--color-primary-100);
  color: var(--color-primary-600);
}

.stat-icon-success {
  background: var(--color-success-100);
  color: var(--color-success-600);
}

.stat-icon-warning {
  background: var(--color-warning-100);
  color: var(--color-warning-600);
}

.stat-icon-error {
  background: var(--color-error-100);
  color: var(--color-error-600);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-2);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Section Headers */
.section-header {
  margin-bottom: var(--spacing-6);
}

.section-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.section-header p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-10);
}

.action-card {
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  padding: var(--spacing-8);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-300);
}

.action-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto var(--spacing-4);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-primary {
  background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
  color: var(--color-primary-600);
}

.action-icon-success {
  background: linear-gradient(135deg, var(--color-success-100), var(--color-success-200));
  color: var(--color-success-600);
}

.action-icon-warning {
  background: linear-gradient(135deg, var(--color-warning-100), var(--color-warning-200));
  color: var(--color-warning-600);
}

.action-icon-info {
  background: linear-gradient(135deg, var(--color-info-100), var(--color-info-200));
  color: var(--color-info-600);
}

.action-icon-secondary {
  background: linear-gradient(135deg, var(--color-secondary-100), var(--color-secondary-200));
  color: var(--color-secondary-600);
}

.action-card h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.action-card p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Activity Card */
.activity-card {
  padding: var(--spacing-6);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
}

.empty-state svg {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.empty-state p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
}

.activity-item:hover {
  background: var(--color-surface);
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon-success {
  background: var(--color-success-100);
  color: var(--color-success-600);
}

.activity-icon-pending {
  background: var(--color-warning-100);
  color: var(--color-warning-600);
}

.activity-icon-rejected {
  background: var(--color-error-100);
  color: var(--color-error-600);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.activity-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
