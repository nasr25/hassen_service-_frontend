<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div>
          <h1>{{ $t('common.welcome') }}, {{ user?.username ?? user?.name }}!</h1>
          <p class="welcome-subtitle">{{ systemTitle }}</p>
        </div>
        <!-- <BaseBadge
          :variant="getRoleBadgeVariant(user?.role)"
          class="role-badge-large"
        >
          {{ $t('admin.' + (user?.role || 'user').toLowerCase()) }}
        </BaseBadge> -->
      </div>

      <!-- Quick Actions -->
      <div class="section-header">
        <h2>{{ $t('dashboard.quickActions') }}</h2>
        <p>{{ $t('dashboard.quickActionsSubtitle') }}</p>
      </div>

      <div class="actions-grid">
        <BaseCard
          v-if="canViewOwnRequests"
          class="action-card"
          @click="goToRequests"
        >
          <div class="action-icon action-icon-primary">
            <svg
              width="32"
              height="32"
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
          <h3>{{ $t('dashboard.myRequests.title') }}</h3>
          <p>{{ $t('dashboard.myRequests.description') }}</p>
        </BaseCard>

        <BaseCard
          v-if="canCreateRequest"
          class="action-card"
          @click="goToNewRequest"
        >
          <div class="action-icon action-icon-success">
            <svg
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3>{{ $t('dashboard.newRequest.title') }}</h3>
          <p>{{ $t('dashboard.newRequest.description') }}</p>
        </BaseCard>

        <BaseCard
          v-if="canViewWorkflow"
          class="action-card"
          @click="goToWorkflowReview"
        >
          <div class="action-icon action-icon-warning">
            <svg
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3>{{ $t('dashboard.reviewRequests.title') }}</h3>
          <p>{{ $t('dashboard.reviewRequests.description') }}</p>
        </BaseCard>

        <BaseCard
          v-if="canViewWorkflow"
          class="action-card"
          @click="goToDepartmentARequests"
        >
          <div class="action-icon action-icon-info">
            <svg
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3>{{ $t('dashboard.allRequests.title') }}</h3>
          <p>{{ $t('dashboard.allRequests.description') }}</p>
        </BaseCard>

        <BaseCard
          v-if="canViewDepartment"
          class="action-card"
          @click="goDepartmentWorkflow"
        >
          <div class="action-icon action-icon-info">
            <svg
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <h3>{{ $t('dashboard.departmentWorkflow.title') }}</h3>
          <p>{{ $t('dashboard.departmentWorkflow.description') }}</p>
        </BaseCard>

        <BaseCard
          v-if="canAccessAdmin"
          class="action-card"
          @click="goToAdmin"
        >
          <div class="action-icon action-icon-info">
            <svg
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h3>{{ $t('dashboard.adminPanel.title') }}</h3>
          <p>{{ $t('dashboard.adminPanel.description') }}</p>
        </BaseCard>

        <BaseCard
          class="action-card"
          @click="goToIdeaBank"
        >
          <div class="action-icon action-icon-primary">

            <svg
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <h3>{{ $t('ideasBank.title') }}</h3>
          <p>{{ $t('ideasBank.short_description') }}</p>
        </BaseCard>
        <a href="https://knowledge-base.gadd.gov.sa/" target="_blank">
          <BaseCard class="action-card">
            <div class="action-icon action-icon-secondary">
              <svg
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <h3>{{ $t('ideasBank.document_library') }}</h3>
            <p>{{ $t('ideasBank.document_library_description') }}</p>
          </BaseCard>
        </a>
      </div>

      <!-- Statistics Card -->
      <div class="profile-card">
        <div class="card-header">
          <h2>{{ $t('profile.statistics') }}</h2>
        </div>
        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon stat-icon-primary">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.totalRequests') }}</div>
                <div class="stat-value">{{ stats.totalRequests }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon stat-icon-info">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.draft') }}</div>
                <div class="stat-value">{{ stats.draftRequests }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon stat-icon-warning">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.pendingRequests') }}</div>
                <div class="stat-value">{{ stats.pendingRequests }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon stat-icon-primary">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.inProgress') }}</div>
                <div class="stat-value">{{ stats.inProgressRequests }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon stat-icon-success">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.approved') }}</div>
                <div class="stat-value">{{ stats.approvedRequests }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon stat-icon-purple">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.completed') }}</div>
                <div class="stat-value">{{ stats.completedRequests }}</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon stat-icon-error">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="stat-details">
                <div class="stat-label">{{ $t('dashboard.stats.rejected') }}</div>
                <div class="stat-value">{{ stats.rejectedRequests }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div
        class="section-header"
        style="margin-top: 30px;"
      >
        <h2>{{ $t('dashboard.charts.title') || 'Request Overview' }}</h2>
        <p>{{ $t('dashboard.charts.subtitle') || 'Visual representation of all requests in the system' }}</p>
      </div>

      <div class="charts-grid">
        <BaseCard class="chart-card">
          <h3 class="chart-title">{{ $t('dashboard.charts.distribution') || 'Request Distribution' }}</h3>
          <div class="chart-container">
            <Pie
              :data="pieChartData"
              :options="pieChartOptions"
            />
          </div>
        </BaseCard>

        <BaseCard class="chart-card">
          <h3 class="chart-title">{{ $t('dashboard.charts.overview') || 'Request Overview' }}</h3>
          <div class="chart-container">
            <Bar
              :data="barChartData"
              :options="barChartOptions"
            />
          </div>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { API_URL, BASE_URL } from "../config/api";
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth";
import { useSettings } from "../composables/useSettings";
import AppLayout from "../components/AppLayout.vue";
import BaseCard from "../components/BaseCard.vue";
import BaseButton from "../components/BaseButton.vue";
import BaseBadge from "../components/BaseBadge.vue";
import { Pie, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import axios from "axios";
import { objectToQueryString } from "../services/handle";
import { httpRequest } from "../services/api";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const router = useRouter();
const authStore = useAuthStore();
const { locale, t } = useI18n();
const { siteName, siteNameAr, fetchPublicSettings } = useSettings();

const user = computed(() => authStore.user);
const systemTitle = computed(() => {
  return locale.value === "ar" ? siteNameAr.value : siteName.value;
});

// Real stats data from API
const stats = ref({
  totalRequests: 0,
  draftRequests: 0,
  pendingRequests: 0,
  inProgressRequests: 0,
  approvedRequests: 0,
  completedRequests: 0,
  rejectedRequests: 0,
});

// Pie Chart Data
const pieChartData = computed(() => ({
  labels: [t("dashboard.stats.inProgress"), t("dashboard.stats.completed")],
  datasets: [
    {
      data: [stats.value.inProgressRequests, stats.value.completedRequests],
      backgroundColor: [
        "rgba(64, 113, 100, 0.8)", // In Progress
        "rgba(150, 166, 163, 0.8)", // Completed
      ],
      borderColor: ["rgba(64, 113, 100, 1)", "rgba(150, 166, 163, 1)"],
      borderWidth: 2,
    },
  ],
}));

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 15,
        font: {
          size: 12,
          family: "IBM Plex Sans Arabic, sans-serif",
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

// Bar Chart Data
const barChartData = computed(() => ({
  labels: [t("dashboard.stats.inProgress"), t("dashboard.stats.completed")],
  datasets: [
    {
      label: t("dashboard.charts.numberOfRequests"),
      data: [stats.value.inProgressRequests, stats.value.completedRequests],
      backgroundColor: [
        "rgba(64, 113, 100, 0.8)", // In Progress
        "rgba(150, 166, 163, 0.8)", // Completed
      ],
      borderColor: ["rgba(64, 113, 100, 1)", "rgba(150, 166, 163, 1)"],
      borderWidth: 2,
    },
  ],
}));

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${t("dashboard.charts.count")}: ${context.parsed.y}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          family: "IBM Plex Sans Arabic, sans-serif",
        },
      },
    },
    x: {
      ticks: {
        font: {
          family: "IBM Plex Sans Arabic, sans-serif",
        },
      },
    },
  },
};

// Load statistics on mount
onMounted(async () => {
  await fetchPublicSettings();
  await loadStatistics();
});

// Fetch statistics from API
const loadStatistics = async () => {
  try {
    const response = await httpRequest("/dashboard/statistics");
    if (response.data.stats) {
      stats.value = {
        totalRequests: response.data.stats.totalRequests || 0,
        draftRequests: response.data.stats.draftRequests || 0,
        pendingRequests: response.data.stats.pendingRequests || 0,
        inProgressRequests: response.data.stats.inProgressRequests || 0,
        approvedRequests: response.data.stats.approvedRequests || 0,
        completedRequests: response.data.stats.completedRequests || 0,
        rejectedRequests: response.data.stats.rejectedRequests || 0,
      };
    }
  } catch (error) {
    console.error("Failed to load statistics:", error);
    // Keep stats at 0 if there's an error
  }
};

// Permission-based access control
const canViewOwnRequests = computed(
  () =>
    authStore.hasPermission("request.view-own") ||
    authStore.hasPermission("request.view-all")
);

const canCreateRequest = computed(() =>
  authStore.hasPermission("request.create")
);

const canViewWorkflow = computed(() =>
  authStore.hasAnyPermission(["workflow.view-pending", "workflow.assign-path"])
);

const canViewDepartment = computed(() =>
  authStore.hasAnyPermission([
    "department.view-requests",
    "department.assign-employee",
  ])
);

const canAccessAdmin = computed(() =>
  authStore.hasAnyPermission(["user.view", "department.view", "role.view"])
);

const getRoleBadgeVariant = (role) => {
  const variants = {
    Admin: "error",
    Manager: "warning",
    User: "primary",
    Employee: "info",
  };
  return variants[role] || "gray";
};

// Navigation methods
const goToRequests = () => {
  router.push("/requests");
};

const goToNewRequest = () => {
  router.push("/requests/new");
};

const goToWorkflowReview = () => {
  router.push("/workflow/review");
};

const goToDepartmentARequests = () => {
  router.push("/department-a-requests");
};

const goDepartmentWorkflow = () => {
  router.push("/department/workflow");
};

const goToAdmin = () => {
  router.push("/admin");
};
const goToIdeaBank = () => {
  router.push("/ideas-bank");
};
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  direction: inherit;
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

/* RTL Support for welcome section */
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

.role-badge-large {
  font-size: var(--font-size-base);
  padding: var(--spacing-2) var(--spacing-6);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Section Headers */
.section-header {
  margin-bottom: var(--spacing-6);
}

/* RTL Support for section headers */
html[dir="rtl"] .section-header {
  text-align: right;
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

/* RTL Support for action cards */
html[dir="rtl"] .action-card {
  direction: rtl;
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
  background: linear-gradient(
    135deg,
    var(--color-primary-100),
    var(--color-primary-200)
  );
  color: var(--color-primary-600);
}

.action-icon-success {
  background: linear-gradient(
    135deg,
    var(--color-success-100),
    var(--color-success-200)
  );
  color: var(--color-success-600);
}

.action-icon-warning {
  background: linear-gradient(
    135deg,
    var(--color-warning-100),
    var(--color-warning-200)
  );
  color: var(--color-warning-600);
}

.action-icon-info {
  background: linear-gradient(
    135deg,
    var(--color-info-100),
    var(--color-info-200)
  );
  color: var(--color-info-600);
}

.action-icon-secondary {
  background: linear-gradient(
    135deg,
    var(--color-secondary-100),
    var(--color-secondary-200)
  );
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

/* Profile Card (Statistics wrapper) */
.profile-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-6);
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

/* Stats Grid */
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

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-10);
}

.chart-card {
  padding: var(--spacing-6);
  min-height: 400px;
}

.chart-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
  text-align: center;
}

.chart-container {
  height: 320px;
  position: relative;
}

/* RTL Support for charts */
html[dir="rtl"] .chart-title {
  text-align: center;
}

/* Override RTL for Dashboard - Force LTR */
[dir="rtl"] .welcome-section {
  direction: rtl !important;
  flex-direction: row !important;
}

[dir="rtl"] .card {
  direction: ltr !important;
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  /* Override RTL for mobile - Keep LTR */
  [dir="rtl"] .welcome-section {
    direction: ltr !important;
    align-items: flex-start !important;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
