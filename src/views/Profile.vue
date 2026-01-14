<template>
  <AppLayout>
    <div class="profile-page">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div>
          <h1>👤 {{ $t('profile.title') }}</h1>
          <p class="welcome-subtitle">{{ $t('profile.subtitle') }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="loading"
      >
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="alert alert-error"
      >
        {{ error }}
      </div>

      <!-- Profile Content -->
      <div
        v-else
        class="profile-content"
      >
        <!-- Account Information Card -->
        <div class="profile-card">
          <div class="card-header">
            <h2>📋 {{ $t('profile.accountInfo') }}</h2>
          </div>
          <div class="card-body">
            <div class="profile-avatar-section">
              <div class="profile-avatar-large">
                <svg
                  width="48"
                  height="48"
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
              <div class="profile-main-info">
                <h3>{{ user.name }}</h3>
                <BaseBadge :variant="getRoleBadgeVariant(user.role)">
                  {{ user.role }}
                </BaseBadge>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
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
                  {{ $t('profile.fullName') }}
                </div>
                <div class="info-value">{{ user.name }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {{ $t('profile.email') }}
                </div>
                <div class="info-value">{{ user.email }}</div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clip-rule="evenodd"
                    />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {{ $t('profile.role') }}
                </div>
                <div class="info-value">
                  <BaseBadge :variant="getRoleBadgeVariant(user.role)">
                    {{ user.role }}
                  </BaseBadge>
                </div>
              </div>

              <div class="info-item">
                <div class="info-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('profile.memberSince') }}
                </div>
                <div class="info-value">{{ formatDate(user.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Information -->
        <div
          v-if="departments.length > 0"
          class="profile-card"
        >
          <div class="card-header">
            <h2>🏢 {{ $t('profile.departments') }}</h2>
          </div>
          <div class="card-body">
            <div class="departments-list">
              <div
                v-for="dept in departments"
                :key="dept.id"
                class="department-item"
              >
                <div class="department-icon">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="department-details">
                  <div class="department-name">{{ dept.name }}</div>
                  <div class="department-role">{{ dept.pivot.role }}</div>
                </div>
                <BaseBadge :variant="dept.is_active ? 'success' : 'gray'">
                  {{ dept.is_active ? $t('common.active') : $t('common.inactive') }}
                </BaseBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Card -->
        <div class="profile-card">
          <div class="card-header">
            <h2>📊 {{ $t('profile.statistics') }}</h2>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon stat-icon-primary">
                  <svg
                    width="24"
                    height="24"
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
                </div>
                <div class="stat-details">
                  <div class="stat-label">{{ $t('dashboard.stats.totalRequests') }}</div>
                  <div class="stat-value">{{ statistics.totalRequests || 0 }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon stat-icon-info">
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path
                      fill-rule="evenodd"
                      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-label">{{ $t('dashboard.stats.draft') }}</div>
                  <div class="stat-value">{{ statistics.draftRequests || 0 }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon stat-icon-warning">
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-label">{{ $t('dashboard.stats.pendingRequests') }}</div>
                  <div class="stat-value">{{ statistics.pendingRequests || 0 }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon stat-icon-success">
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-label">{{ $t('dashboard.stats.approved') }}</div>
                  <div class="stat-value">{{ statistics.approvedRequests || 0 }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon stat-icon-purple">
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-label">{{ $t('dashboard.stats.completed') }}</div>
                  <div class="stat-value">{{ statistics.completedRequests || 0 }}</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon stat-icon-error">
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="stat-details">
                  <div class="stat-label">{{ $t('dashboard.stats.rejected') }}</div>
                  <div class="stat-value">{{ statistics.rejectedRequests || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { API_URL, BASE_URL } from "../config/api";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAlert } from "../composables/useAlert";
import axios from "axios";
import { useAuthStore } from "../stores/auth";
import AppLayout from "../components/AppLayout.vue";
import BaseBadge from "../components/BaseBadge.vue";
import { objectToQueryString } from "../services/handle";
import { httpRequest } from "../services/api";

const { t } = useI18n();
const { showSuccess, showError, showConfirm, showDeleteConfirm } = useAlert();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const user = ref(authStore.user || {});
const departments = ref([]);
const statistics = ref({
  totalRequests: 0,
  draftRequests: 0,
  pendingRequests: 0,
  approvedRequests: 0,
  completedRequests: 0,
  rejectedRequests: 0,
});

const fetchProfile = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await httpRequest(`/auth/user`);

    if (response.data && response.data.user) {
      user.value = response.data.user;
      departments.value = response.data.user.departments || [];
    }

    // Fetch user statistics

    const statsResponse = await httpRequest(`/dashboard/statistics`);
    if (statsResponse.data.stats) {
      statistics.value = {
        totalRequests: statsResponse.data.stats.totalRequests || 0,
        draftRequests: statsResponse.data.stats.draftRequests || 0,
        pendingRequests: statsResponse.data.stats.pendingRequests || 0,
        approvedRequests: statsResponse.data.stats.approvedRequests || 0,
        completedRequests: statsResponse.data.stats.completedRequests || 0,
        rejectedRequests: statsResponse.data.stats.rejectedRequests || 0,
      };
    }
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    showError(t("profile.failedToLoad"));
  } finally {
    loading.value = false;
  }
};

const getRoleBadgeVariant = (role) => {
  const variants = {
    Admin: "error",
    Manager: "warning",
    User: "primary",
    Employee: "info",
  };
  return variants[role] || "gray";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

html[dir="rtl"] .profile-page {
  text-align: right;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, #02735e 0%, #02735e 100%);
  border-radius: var(--radius-2xl);
  color: white;
}

html[dir="rtl"] .welcome-section {
  direction: rtl;
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

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: #02735e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.alert {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-6);
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.profile-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all var(--transition-base);
}

.profile-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(34, 197, 94, 0.2);
}

html[dir="rtl"] .profile-card {
  direction: rtl;
}

.card-header {
  padding: var(--spacing-5);
  border-bottom: 2px solid rgba(34, 197, 94, 0.2);
  background: linear-gradient(to bottom, #f0fdf4, #ffffff);
}

.card-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: #015a4a;
  margin: 0;
}

.card-body {
  padding: var(--spacing-6);
}

/* Profile Avatar Section */
.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

html[dir="rtl"] .profile-avatar-section {
  flex-direction: row-reverse;
}

.profile-avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
}

.profile-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

html[dir="rtl"] .profile-main-info {
  align-items: flex-end;
  text-align: right;
}

.profile-main-info h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-5);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

html[dir="rtl"] .info-item {
  align-items: flex-end;
  text-align: right;
}

.info-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

html[dir="rtl"] .info-label {
  flex-direction: row-reverse;
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Departments List */
.departments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.department-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

html[dir="rtl"] .department-item {
  flex-direction: row-reverse;
}

.department-item:hover {
  background: #f0fdf4;
  border-color: #02735e;
}

.department-icon {
  width: 40px;
  height: 40px;
  background: #02735e;
  color: white;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.department-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

html[dir="rtl"] .department-details {
  align-items: flex-end;
  text-align: right;
}

.department-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.department-role {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

html[dir="rtl"] .stat-item {
  flex-direction: row-reverse;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  color: white;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-icon-info {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.stat-icon-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon-success {
  background: linear-gradient(135deg, #02735e, #015a4a);
}

.stat-icon-purple {
  background: linear-gradient(135deg, #a855f7, #9333ea);
}

.stat-icon-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

html[dir="rtl"] .stat-details {
  align-items: flex-end;
  text-align: right;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .profile-main-info {
    align-items: center;
  }
}
</style>
