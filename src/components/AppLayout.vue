<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <!-- Use custom logo if available, otherwise show default SVG -->
          <img v-if="logo" :src="logo" alt="Logo" class="logo-image" />
          <svg v-else width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#gradient)" />
            <path d="M24 14L34 20V28L24 34L14 28V20L24 14Z" fill="white" opacity="0.9" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stop-color="#2563eb" />
                <stop offset="100%" stop-color="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <span v-if="!sidebarCollapsed" class="logo-text">{{ displaySiteName }}</span>
        </div>
        <button @click="toggleSidebar" class="toggle-btn" :title="sidebarCollapsed ? 'Expand' : 'Collapse'">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  :d="sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="active">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.dashboard') }}</span>
        </router-link>

        <router-link to="/requests/new" class="nav-item" active-class="active">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.newRequest') }}</span>
        </router-link>

        <router-link to="/requests" class="nav-item" active-class="active">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.myRequests') }}</span>
        </router-link>

        <router-link v-if="canReview" to="/workflow/review" class="nav-item" active-class="active">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.workflowReview') }}</span>
        </router-link>

        <router-link v-if="isAdmin" to="/admin" class="nav-item" active-class="active">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!sidebarCollapsed">{{ $t('nav.admin') }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <LanguageSwitcher v-if="!sidebarCollapsed" />
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="top-nav-left">
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>

        <div class="top-nav-right">
          <!-- Notifications -->
          <button class="icon-button" title="Notifications">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </button>

          <!-- User Menu -->
          <div class="user-menu" @click="toggleUserMenu">
            <div class="user-avatar">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="user-info">
              <div class="user-name">{{ authStore.user?.name }}</div>
              <div class="user-role">
                <BaseBadge :variant="getRoleBadgeVariant(authStore.user?.role)">
                  {{ authStore.user?.role }}
                </BaseBadge>
              </div>
            </div>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>

            <!-- Dropdown Menu -->
            <div v-if="userMenuOpen" class="user-dropdown">
              <router-link to="/profile" class="dropdown-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                {{ $t('nav.profile') }}
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                </svg>
                {{ $t('nav.settings') }}
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="dropdown-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../composables/useSettings'
import BaseBadge from './BaseBadge.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t, locale } = useI18n()
const { siteName, siteNameAr, logo, fetchPublicSettings } = useSettings()

const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)

const pageTitle = computed(() => {
  const titles = {
    '/dashboard': t('nav.dashboard'),
    '/requests/new': t('nav.newRequest'),
    '/requests': t('nav.myRequests'),
    '/workflow/review': t('nav.workflowReview'),
    '/admin': t('nav.admin')
  }
  return titles[route.path] || t('nav.dashboard')
})

const isAdmin = computed(() => authStore.user?.role?.toLowerCase() === 'admin')

const canReview = computed(() => {
  const role = authStore.user?.role
  return role && role !== 'User' && role !== 'Employee'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const getRoleBadgeVariant = (role) => {
  const variants = {
    'Admin': 'error',
    'Manager': 'warning',
    'User': 'primary',
    'Employee': 'info'
  }
  return variants[role] || 'gray'
}

// Computed property to get the site name based on current locale
const displaySiteName = computed(() => {
  return locale.value === 'ar' ? siteNameAr.value : siteName.value
})

// Fetch settings on mount
onMounted(async () => {
  await fetchPublicSettings()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-surface);
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #008844;
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
  padding: var(--spacing-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.logo-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
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
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
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
  transition: margin-left var(--transition-base), margin-right var(--transition-base);
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
  background: #008844;
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
  color: #ffffff;
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
  color: #ffffff;
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

[dir="rtl"] .logo {
  flex-direction: row-reverse;
}

[dir="rtl"] .nav-item {
  flex-direction: row-reverse;
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
}

[dir="rtl"] .top-nav-right {
  flex-direction: row-reverse;
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
</style>
