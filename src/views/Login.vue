<template>
  <div class="login-container">
    <!-- Language Switcher -->
    <div class="language-switcher-wrapper">
      <LanguageSwitcher />
    </div>

    <!-- Left Panel: White Background with Login Form -->
    <div class="login-panel">
      <div class="login-content">
        <div class="login-header">
          <div class="logo-icon">
            <img v-if="logo" :src="logo" alt="Logo" class="logo-image" />
            <svg v-else width="56" height="56" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#gradient)" />
              <path d="M24 14L34 20V28L24 34L14 28V20L24 14Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stop-color="#02735E" />
                  <stop offset="100%" stop-color="#02735E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>{{ $t('auth.login') }}</h1>
          <p class="subtitle">{{ systemTitle }}</p>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <BaseInput
            v-model="form.username"
            type="text"
            :label="$t('auth.username')"
            :placeholder="$t('auth.username')"
            required
          />

          <BaseInput
            v-model="form.password"
            type="password"
            :label="$t('auth.password')"
            :placeholder="$t('auth.password')"
            required
          />

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="isLoading"
            class="login-button"
          >
            {{ isLoading ? $t('common.loading') : $t('auth.login') }}
          </BaseButton>
        </form>

        <!-- Test Accounts Section -->
        <div class="test-accounts">
          <div class="test-accounts-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <h3>{{ $t('auth.testAccounts') }}</h3>
          </div>

          <div v-if="isLoadingAccounts" class="loading-accounts">
            <div class="spinner"></div>
            <p>{{ $t('common.loading') }}</p>
          </div>
          <div v-else-if="testAccounts.length === 0" class="no-accounts">
            <p>{{ $t('common.noUsersFound') }}</p>
          </div>
          <div v-else class="accounts-compact">
            <div
              v-for="account in testAccounts"
              :key="account.username"
              class="test-account"
              @click="fillLogin(account.username)"
            >
              <span class="account-icon">{{ account.icon }}</span>
              <div class="account-info">
                <strong>{{ account.name }}</strong>
                <code>{{ account.username }}</code>
              </div>
            </div>
          </div>

          <div class="password-note">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            {{ $t('auth.passwordNote') }} <strong>{{ $t('auth.passwordValue') }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Green Background with Welcome -->
    <div class="welcome-panel">
      <div class="welcome-content">
        <div class="welcome-icon">
          <img v-if="logo" :src="logo" alt="Logo" class="welcome-logo-image" />
          <svg v-else width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="60" fill="rgba(255, 255, 255, 0.1)" />
            <path d="M60 30L80 42V66L60 78L40 66V42L60 30Z" fill="white" opacity="0.9" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="54" r="24" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
          </svg>
        </div>

        <h1 class="welcome-title">{{ $t('auth.welcome') || 'مرحباً' }}</h1>
        <p class="welcome-description">{{ systemTitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import { useSettings } from '../composables/useSettings'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import axios from 'axios'
import { API_URL } from '../config/api'
import { useAlert } from '../composables/useAlert'

const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()
const { showSuccess, showError, showConfirm, showDeleteConfirm } = useAlert()
const { logo, siteName, siteNameAr, fetchPublicSettings } = useSettings()

// Computed property for system title based on locale
const systemTitle = computed(() => {
  return locale.value === 'ar' ? siteNameAr.value : siteName.value
})

onMounted(async () => {
  fetchPublicSettings()
  await fetchDemoAccounts()
})

const form = ref({
  username: '',
  password: ''
})

const error = ref(null)
const isLoading = ref(false)
const testAccounts = ref([])
const isLoadingAccounts = ref(false)

const fetchDemoAccounts = async () => {
  try {
    isLoadingAccounts.value = true
    const response = await axios.get(`${API_URL}/auth/demo-accounts`)
    testAccounts.value = response.data.users
  } catch (err) {
    console.error('Failed to fetch demo accounts:', err)
    // Fallback to empty array if fetch fails
    testAccounts.value = []
  } finally {
    isLoadingAccounts.value = false
  }
}

const handleLogin = async () => {
  error.value = null
  isLoading.value = true

  const result = await authStore.login(form.value.username, form.value.password)

  isLoading.value = false

  if (result.success) {
    router.push('/dashboard')
  } else {
    showError(result.error || t('auth.loginFailed'))
  }
}

const fillLogin = async (username) => {
  form.value.username = username
  form.value.password = 'password'
  // Auto-submit the form after filling
  await handleLogin()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  direction: inherit;
}

/* RTL Support - Swap panels for RTL */
html[dir="rtl"] .login-container {
  direction: rtl;
}

html[dir="rtl"] .login-panel {
  order: 2;
}

html[dir="rtl"] .welcome-panel {
  order: 1;
}

.language-switcher-wrapper {
  position: absolute;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: var(--z-fixed);
}

html[dir="rtl"] .language-switcher-wrapper {
  right: auto;
  left: var(--spacing-6);
}

/* Left Panel - White Background with Login Form */
.login-panel {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  overflow-y: auto;
}

.login-content {
  width: 100%;
  max-width: 480px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.logo-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-4);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 640px) {
  .logo-image {
    width: 80px;
    height: 80px;
  }
}

.login-header h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.alert {
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-sm);
}

.alert-error {
  background: var(--color-error-50);
  color: var(--color-error-700);
  border: 1px solid var(--color-error-200);
}

.login-form {
  margin-bottom: var(--spacing-6);
}

.login-button {
  width: 100%;
  margin-top: var(--spacing-4);
}

/* Test Accounts Section */
.test-accounts {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  border: 1px solid var(--color-border);
}

.test-accounts-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: #02735E;
  margin-bottom: var(--spacing-4);
  justify-content: center;
}

.test-accounts-header h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.loading-accounts,
.no-accounts {
  text-align: center;
  padding: var(--spacing-6);
  color: var(--color-text-secondary);
}

.loading-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: #02735E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.accounts-compact {
  display: grid;
  gap: var(--spacing-2);
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: var(--spacing-4);
}

.test-account {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.test-account:hover {
  border-color: #02735E;
  background: rgba(2, 115, 94, 0.05);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

html[dir="rtl"] .test-account:hover {
  transform: translateX(-4px);
}

.account-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.account-info strong {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-info code {
  font-size: 10px;
  color: #02735E;
  background: rgba(2, 115, 94, 0.1);
  padding: 2px var(--spacing-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.password-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  color: var(--color-warning-700);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-xs);
  text-align: center;
}

.password-note strong {
  color: var(--color-warning-800);
  font-weight: var(--font-weight-semibold);
}

/* Right Panel - Green Background with Welcome */
.welcome-panel {
  background: linear-gradient(135deg, #02735E 0%, #02735E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  color: white;
  overflow-y: auto;
}

.welcome-content {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.welcome-icon {
  margin-bottom: var(--spacing-8);
  display: flex;
  justify-content: center;
}

.welcome-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

@media (max-width: 1024px) {
  .welcome-logo-image {
    width: 150px;
    height: 150px;
  }
}

.welcome-title {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: white;
  margin-bottom: var(--spacing-4);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-description {
  font-size: var(--font-size-xl);
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: var(--spacing-10);
  line-height: 1.6;
}

/* Features List */
.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  text-align: right;
}

html[dir="ltr"] .features-list {
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--transition-base);
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.feature-text {
  flex: 1;
}

.feature-text h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: white;
  margin-bottom: var(--spacing-2);
}

.feature-text p {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .welcome-panel {
    display: none;
  }

  .login-panel {
    padding: var(--spacing-6);
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: 0;
  }

  .login-panel {
    padding: var(--spacing-4);
  }

  .login-content {
    max-width: 100%;
  }

  .login-header h1 {
    font-size: var(--font-size-2xl);
  }

  .accounts-compact {
    max-height: 200px;
  }
}
</style>
