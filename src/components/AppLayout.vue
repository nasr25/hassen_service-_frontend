<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ 'sidebar-collapsed': sidebarCollapsed }"
    >
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo">
            <!-- Use custom logo if available, otherwise show default SVG -->
            <img
              v-if="logo"
              :src="logo"
              alt="Logo"
              class="logo-image"
              @error="onLogoError"
            />

          </div>
          <!--
          <span
            v-if="!sidebarCollapsed"
            class="logo-text"
          >{{ displaySiteName }}</span>
          !-->
        </div>
        <button
          @click="toggleSidebar"
          class="toggle-btn"
          :title="sidebarCollapsed ? 'Expand' : 'Collapse'"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="rgba(226, 231, 238) "
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"
            />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          to="/dashboard"
          class="nav-item"
          active-class="active"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.dashboard') }}</span>
        </router-link>
        <span class="my-3 mx-auto divider"></span>

        <router-link
          v-if="canCreateRequest"
          to="/requests/new"
          class="nav-item "
          active-class="active"
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
          <span v-if="!sidebarCollapsed">{{ $t('nav.newRequest') }}</span>
        </router-link>

        <router-link
          v-if="canViewOwnRequests"
          to="/requests"
          class="nav-item"
          active-class="active"
        >
          <svg
            width="20"
            height="20"
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
          <span v-if="!sidebarCollapsed">{{ $t('nav.myIdeas') }}</span>
        </router-link>
        <router-link
          to="/surveys"
          class="nav-item"
          active-class="active"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.surveys') }}</span>
        </router-link>

        <!---
        <router-link
          to="/ideas-bank"
          class="nav-item"
          active-class="active"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.ideasBank') }}</span>
        </router-link>
!--->
        <router-link
          v-if="canReview"
          to="/workflow/review"
          class="nav-item"
          active-class="active"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clip-rule="evenodd"
            />
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.workflowReview') }}</span>
        </router-link>

        <router-link
          v-if="isAdmin"
          to="/admin"
          class="nav-item"
          active-class="active"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clip-rule="evenodd"
            />
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.admin') }}</span>
        </router-link>
      </nav>
      <!--
      <div class="sidebar-footer">
        <LanguageSwitcher v-if="!sidebarCollapsed" />
      </div>
      !-->
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="top-nav-left">
          <h2 class="page-title">{{ systemTitle }}</h2>
        </div>

        <div class="top-nav-right">
          <!--languag Swither !-->
          <LanguageSwitcher v-if="!sidebarCollapsed" />
          <!-- Notifications -->
          <div class="notifications-wrapper">
            <button
              class="icon-button"
              @click="toggleNotifications"
              :title="$t('nav.notifications')"
            >
              <svg
                width="20"
                height="20"
                fill="rgba(var(--v-theme-dark_600), 1)"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="notification-badge"
              >{{ unreadCount }}</span>
            </button>

            <!-- Notifications Dropdown -->
            <div
              v-if="notificationsOpen"
              class="notifications-dropdown"
            >
              <div class="notifications-header">
                <h3>{{ $t('nav.notifications') }}</h3>
                <button
                  v-if="notifications.length > 0"
                  @click="markAllAsRead"
                  class="mark-all-read"
                >
                  {{ $t('notifications.markAllRead') }}
                </button>
              </div>

              <div
                v-if="loadingNotifications"
                class="notifications-loading"
              >
                <div class="spinner-small"></div>
                <span>{{ $t('common.loading') }}</span>
              </div>

              <div
                v-else-if="notifications.length === 0"
                class="notifications-empty"
              >
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p>{{ $t('notifications.noNotifications') }}</p>
              </div>

              <div
                v-else
                class="notifications-list"
              >
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'unread': !notification.read_at }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-icon">
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ getNotificationTitle(notification) }}</div>
                    <div class="notification-message">{{ getNotificationMessage(notification) }}</div>
                    <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
                  </div>
                  <button
                    @click.stop="deleteNotification(notification.id)"
                    class="notification-delete"
                    :title="$t('common.delete')"
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- User Menu -->
          <div
            class="user-menu"
            @click="toggleUserMenu"
          >
            <div class="user-avatar">
              <svg
                width="20"
                height="20"
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
            <div class="user-info">
              <div class="user-name">{{ authStore.user?.name }}</div>
              <!--
              <div class="user-role">
                <BaseBadge :variant="getRoleBadgeVariant(authStore.user?.role)">
                  {{ authStore.user?.role }}
                </BaseBadge>
              </div>
              !-->
            </div>
            <svg
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>

            <!-- Dropdown Menu -->
            <div
              v-if="userMenuOpen"
              class="user-dropdown"
            >
              <router-link
                to="/profile"
                class="dropdown-item"
              >
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
                {{ $t('nav.profile') }}
              </router-link>
              <!-- Temporarily hidden settings link -->
              <!-- <router-link to="/settings" class="dropdown-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                </svg>
                {{ $t('nav.settings') }}
              </router-link> -->
              <div class="dropdown-divider"></div>
              <button
                @click="handleLogout"
                class="dropdown-item"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ $t('common.logout') }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";
import { useSettings } from "../composables/useSettings";
import axios from "axios";
import BaseBadge from "./BaseBadge.vue";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { API_URL } from "../config/api";
import staticLogo from "../assets/images/svg/logo_light.svg";
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t, locale } = useI18n();
const { siteName, siteNameAr, logo: settingsLogo, fetchPublicSettings } = useSettings();

// Use settings logo if available, fall back to static SVG
const logoFailed = ref(false);
const logo = computed(() => {
  if (logoFailed.value) return staticLogo;
  return settingsLogo.value || staticLogo;
});
const onLogoError = () => {
  logoFailed.value = true;
};

const sidebarCollapsed = ref(false);
const userMenuOpen = ref(false);

// Notification state
const notificationsOpen = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const loadingNotifications = ref(false);
let notificationInterval = null;

const pageTitle = computed(() => {
  const titles = {
    "/dashboard": t("nav.dashboard"),
    "/requests/new": t("nav.newRequest"),
    "/requests": t("nav.myIdeas"),
    "/workflow/review": t("nav.workflowReview"),
    "/admin": t("nav.admin"),
    "/surveys": t("nav.surveys"),
  };
  return titles[route.path] || t("nav.dashboard");
});

const systemTitle = computed(() => {
  return locale.value === "ar" ? siteNameAr.value : siteName.value;
});

const isAdmin = computed(() => authStore.user?.role?.toLowerCase() === "admin");

const canReview = computed(
  () =>
    !isAdmin.value &&
    authStore.hasAnyPermission([
      "workflow.view-pending",
      "workflow.assign-path",
    ])
);

const canCreateRequest = computed(() =>
  authStore.hasPermission("request.create")
);

const canViewOwnRequests = computed(
  () =>
    authStore.hasPermission("request.view-own") ||
    authStore.hasPermission("request.view-all")
);

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
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

// Computed property to get the site name based on current locale
const displaySiteName = computed(() => {
  return locale.value === "ar" ? siteNameAr.value : siteName.value;
});

// Notification functions
const toggleNotifications = async () => {
  notificationsOpen.value = !notificationsOpen.value;
  if (notificationsOpen.value) {
    await fetchNotifications();
  }
};

const fetchNotifications = async () => {
  try {
    loadingNotifications.value = true;
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    notifications.value = response.data.notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  } finally {
    loadingNotifications.value = false;
  }
};

const fetchUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    unreadCount.value = response.data.count;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
  }
};

const handleNotificationClick = async (notification) => {
  // Mark as read
  if (!notification.read_at) {
    try {
      await axios.post(
        `${API_URL}/notifications/${notification.id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );
      // Update local state
      notification.read_at = new Date();
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  // Navigate to request if available
  if (notification.request_id) {
    router.push(`/requests/${notification.request_id}`);
    notificationsOpen.value = false;
  }
};

const markAllAsRead = async () => {
  try {
    await axios.post(
      `${API_URL}/notifications/read-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    // Update local state
    notifications.value.forEach((n) => (n.read_at = new Date()));
    unreadCount.value = 0;
  } catch (error) {
    console.error("Failed to mark all as read:", error);
  }
};

const deleteNotification = async (id) => {
  try {
    await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    // Remove from local state
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      const wasUnread = !notifications.value[index].read_at;
      notifications.value.splice(index, 1);
      if (wasUnread) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    }
  } catch (error) {
    console.error("Failed to delete notification:", error);
  }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("common.justNow");
  if (minutes < 60) return t("common.minutesAgo", { count: minutes });
  if (hours < 24) return t("common.hoursAgo", { count: hours });
  if (days < 7) return t("common.daysAgo", { count: days });
  return date.toLocaleDateString();
};

// Notification translation helpers
const getNotificationTitle = (notification) => {
  const typeMap = {
    request_created: "notifications.titles.newRequestSubmitted",
    request_status_changed: "notifications.titles.requestResubmitted",
    request_assigned: "notifications.titles.requestAssignedToYou",
    request_approved: "notifications.titles.requestCompleted",
    request_rejected: "notifications.titles.requestRejected",
    request_completed: "notifications.titles.requestCompleted",
  };

  const key = typeMap[notification.type];
  return key ? t(key) : notification.title;
};

const getNotificationMessage = (notification) => {
  const typeMap = {
    request_created: "notifications.messages.newRequestSubmitted",
    request_status_changed: "notifications.messages.requestResubmitted",
    request_assigned: "notifications.messages.requestAssignedToYou",
    request_approved: "notifications.messages.requestCompleted",
    request_rejected: "notifications.messages.requestRejected",
    request_completed: "notifications.messages.requestCompleted",
  };

  const key = typeMap[notification.type];
  if (!key) return notification.message;

  // Parse data for placeholder replacement
  const data = notification.data || {};
  return t(key, {
    id: notification.request_id || "",
    user: data.user_name || "",
    path: data.path_name || "",
    employee: data.employee_name || "",
  });
};

// Fetch settings on mount
onMounted(async () => {
  //await fetchPublicSettings();
  // Fetch initial unread count
  //await fetchUnreadCount();
  // Poll for new notifications every 30 seconds
  //notificationInterval = setInterval(fetchUnreadCount, 30000);
});

onBeforeUnmount(() => {
  if (notificationInterval) {
    // clearInterval(notificationInterval);
  }
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "IBM Plex Sans Arabic", sans-serif;
  font-weight: 400;
  letter-spacing: unset !important;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "IBM Plex Sans Arabic", sans-serif;
  font-weight: 400;
  letter-spacing: unset !important;
}

body,
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-surface);
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: rgba(var(--v-theme-dark_white), 1) !important;

  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  position: fixed;
  left: 0;
  height: 100vh;
  z-index: var(--z-sticky);
}

/* RTL Support - Sidebar on the right for Arabic */
[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-collapsed {
  width: 72px;
}

.sidebar-header {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: fit-content;
}

.sidebar-collapsed .sidebar-header {
  min-height: 72px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  flex: 1;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.logo-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: #fff;
  padding: var(--spacing-4);
}

.sidebar-collapsed .logo-image {
  max-width: 48px;
  max-height: 48px;
  padding: var(--spacing-2);
}

/* Responsive logo sizing */
@media (max-width: 1024px) {
  .logo-image {
    max-width: 160px;
    max-height: 100px;
  }
}

@media (max-width: 768px) {
  .logo-image {
    max-width: 140px;
    max-height: 80px;
    padding: var(--spacing-2);
  }
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
  text-align: center;
  width: 100%;
}

.toggle-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-4);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  color: rgba(var(--v-theme-dark_600), 1) !important;
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.nav-item:hover {
  background-color: rgba(var(--v-theme-primary), 1) !important;
  color: #ffffff;
}

.nav-item.active {
  background-color: rgba(var(--v-theme-primary), 1) !important;
  color: rgba(var(--v-theme-dark_white), 1) !important;
  border-radius: 8px !important;
  font-weight: var(--font-weight-bold);
  transition: 0.4s;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: var(--spacing-3);
}

.sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left var(--transition-base),
    margin-right var(--transition-base);
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed ~ .main-content {
  margin-left: 72px;
}

/* RTL Support - Main content margin adjustment */
[dir="rtl"] .main-content {
  margin-left: 0;
  margin-right: 260px;
}

[dir="rtl"] .sidebar-collapsed ~ .main-content {
  margin-left: 0;
  margin-right: 72px;
}

/* Top Navigation */
.top-nav {
  height: 72px;
  background: rgba(var(--v-theme-dark_white), 1) !important;

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 var(--spacing-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.top-nav-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: rgba(var(--v-theme-primary_900), 1) !important;
  margin: 0;
}

.top-nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

/* User Menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: rgba(var(--v-theme-dark_900), 1);
}

.user-role {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.8);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  padding: var(--spacing-2);
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-2) 0;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: var(--spacing-8);
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar-collapsed {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .page-content {
    padding: var(--spacing-4);
  }
}

/* RTL Support */
[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
  border-right: none;
  border-left: 1px solid var(--color-border);
}

[dir="rtl"] .main-content {
  margin-left: 0;
  margin-right: 260px;
}

[dir="rtl"] .sidebar-collapsed ~ .main-content {
  margin-left: 0;
  margin-right: 72px;
}

[dir="rtl"] .sidebar-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .logo-container {
  flex-direction: column;
  align-items: center;
}

[dir="rtl"] .logo {
  flex-direction: row;
  justify-content: center;
}

[dir="rtl"] .nav-item {
  text-align: right;
  justify-content: flex-start;
}

[dir="rtl"] .nav-item svg {
  margin-left: 0;
  margin-right: 0;
}

[dir="rtl"] .sidebar-collapsed .nav-item {
  justify-content: center;
}

[dir="rtl"] .top-nav {
  flex-direction: row-reverse;
}

[dir="rtl"] .top-nav-left {
  text-align: right;
  order: 2;
}

[dir="rtl"] .top-nav-right {
  flex-direction: row-reverse;
  order: 1;
}

[dir="rtl"] .user-menu {
  flex-direction: row-reverse;
}

[dir="rtl"] .icon-button {
  margin-left: 0;
  margin-right: 0;
}

[dir="rtl"] .user-dropdown {
  right: auto;
  left: 0;
}

[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
  text-align: right;
}

[dir="rtl"] .user-info {
  align-items: flex-end;
  text-align: right;
}

[dir="rtl"] .sidebar-footer {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .page-title {
  text-align: right;
}

/* RTL Mobile Responsive */
@media (max-width: 768px) {
  [dir="rtl"] .sidebar {
    transform: translateX(100%);
  }

  [dir="rtl"] .sidebar-collapsed {
    transform: translateX(0);
  }

  [dir="rtl"] .main-content {
    margin-right: 0;
  }
}

/* Notifications */
.notifications-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  padding: 2px 5px;
  border-radius: var(--radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 400px;
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: var(--z-dropdown);
}

.notifications-header {
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
}

.notifications-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.mark-all-read {
  background: none;
  border: none;
  color: #02735e;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--spacing-2);
  transition: opacity var(--transition-fast);
}

.mark-all-read:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.notifications-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  gap: var(--spacing-3);
  color: var(--color-text-secondary);
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: #02735e;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  gap: var(--spacing-3);
  color: var(--color-text-secondary);
}

.notifications-empty svg {
  opacity: 0.3;
}

.notifications-empty p {
  margin: 0;
  font-size: var(--font-size-sm);
}

.notifications-list {
  overflow-y: auto;
  max-height: 500px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}

.notification-item:hover {
  background: var(--color-surface);
}

.notification-item.unread {
  background: rgba(34, 197, 94, 0.05);
}

.notification-item.unread::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #02735e;
}

.notification-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-1);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.notification-delete {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0;
}

.notification-item:hover .notification-delete {
  opacity: 1;
}

.notification-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* RTL Notifications */
[dir="rtl"] .notifications-dropdown {
  right: auto;
  left: 0;
}

[dir="rtl"] .notifications-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .notification-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .notification-item.unread::before {
  left: auto;
  right: 0;
}

[dir="rtl"] .notification-content {
  text-align: right;
}

@media (max-width: 480px) {
  .notifications-dropdown {
    width: 340px;
  }
}
</style>
