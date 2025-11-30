<template>
  <div class="login-container">
    <div class="language-switcher-wrapper">
      <LanguageSwitcher />
    </div>

    <div class="login-content">
      <!-- Login Card -->
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="url(#gradient)" />
                <path d="M24 14L34 20V28L24 34L14 28V20L24 14Z" fill="white" opacity="0.9" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stop-color="#2563eb" />
                    <stop offset="100%" stop-color="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1>{{ $t('auth.login') }}</h1>
              <p class="subtitle">{{ $t('dashboard.subtitle') }}</p>
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <BaseInput
            v-model="form.email"
            type="email"
            :label="$t('auth.email')"
            :placeholder="$t('auth.email')"
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
            <h3>Test Accounts</h3>
          </div>

          <!-- Admin & User -->
          <div class="account-category">
            <h4>System Users</h4>
            <div class="accounts-grid">
              <div
                v-for="account in testAccounts.filter(a => ['Admin', 'User'].includes(a.category))"
                :key="account.email"
                class="test-account"
                @click="fillLogin(account.email)"
              >
                <span class="account-icon">{{ account.icon }}</span>
                <div class="account-info">
                  <strong>{{ account.role }}</strong>
                  <code>{{ account.email }}</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Managers -->
          <div class="account-category">
            <h4>Managers</h4>
            <div class="accounts-grid">
              <div
                v-for="account in testAccounts.filter(a => a.category === 'Managers')"
                :key="account.email"
                class="test-account"
                @click="fillLogin(account.email)"
              >
                <span class="account-icon">{{ account.icon }}</span>
                <div class="account-info">
                  <strong>{{ account.role }}</strong>
                  <code>{{ account.email }}</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Employees -->
          <div class="account-category">
            <h4>Employees</h4>
            <div class="accounts-grid">
              <div
                v-for="account in testAccounts.filter(a => a.category === 'Employees')"
                :key="account.email"
                class="test-account"
                @click="fillLogin(account.email)"
              >
                <span class="account-icon">{{ account.icon }}</span>
                <div class="account-info">
                  <strong>{{ account.role }}</strong>
                  <code>{{ account.email }}</code>
                </div>
              </div>
            </div>
          </div>

          <div class="password-note">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            Password for all accounts: <strong>password</strong>
          </div>
        </div>
      </div>

      <!-- Feature Highlights (Optional) -->
      <div class="features-section">
        <h2>Workflow Management System</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h3>Request Management</h3>
            <p>Create and track workflow requests efficiently</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <h3>Multi-Department</h3>
            <p>Collaborative approval workflows across teams</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h3>Real-time Updates</h3>
            <p>Get instant notifications on status changes</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const error = ref(null)
const isLoading = ref(false)

const testAccounts = [
  { icon: '👨‍💼', role: 'Admin', email: 'admin@workflow.com', category: 'Admin' },
  { icon: '👤', role: 'User', email: 'user@workflow.com', category: 'User' },
  { icon: '👔', role: 'Dept A Manager', email: 'manager.a@workflow.com', category: 'Managers' },
  { icon: '🔧', role: 'Tech Manager', email: 'manager.tech@workflow.com', category: 'Managers' },
  { icon: '💰', role: 'Finance Manager', email: 'manager.finance@workflow.com', category: 'Managers' },
  { icon: '⚖️', role: 'Legal Manager', email: 'manager.legal@workflow.com', category: 'Managers' },
  { icon: '📊', role: 'Strategy Manager', email: 'manager.strategy@workflow.com', category: 'Managers' },
  { icon: '👥', role: 'HR Manager', email: 'manager.hr@workflow.com', category: 'Managers' },
  { icon: '🔧', role: 'Tech Employee 1', email: 'emp.tech1@workflow.com', category: 'Employees' },
  { icon: '🔧', role: 'Tech Employee 2', email: 'emp.tech2@workflow.com', category: 'Employees' },
  { icon: '💰', role: 'Finance Employee', email: 'emp.finance@workflow.com', category: 'Employees' },
  { icon: '⚖️', role: 'Legal Employee', email: 'emp.legal@workflow.com', category: 'Employees' },
  { icon: '📊', role: 'Strategy Employee 1', email: 'emp.strategy1@workflow.com', category: 'Employees' },
  { icon: '📊', role: 'Strategy Employee 2', email: 'emp.strategy2@workflow.com', category: 'Employees' },
  { icon: '👥', role: 'HR Employee 1', email: 'emp.hr1@workflow.com', category: 'Employees' },
  { icon: '👥', role: 'HR Employee 2', email: 'emp.hr2@workflow.com', category: 'Employees' }
]

const handleLogin = async () => {
  error.value = null
  isLoading.value = true

  const result = await authStore.login(form.value.email, form.value.password)

  isLoading.value = false

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error || 'Login failed. Please try again.'
  }
}

const fillLogin = (email) => {
  form.value.email = email
  form.value.password = 'password'
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--spacing-8);
  position: relative;
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

.login-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-8);
  max-width: 1200px;
  width: 100%;
}

@media (min-width: 1024px) {
  .login-content {
    grid-template-columns: 500px 1fr;
    align-items: start;
  }
}

.login-card {
  background: var(--color-background);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-10);
  box-shadow: var(--shadow-2xl);
  max-height: 90vh;
  overflow-y: auto;
}

.login-header {
  margin-bottom: var(--spacing-8);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.logo-icon {
  flex-shrink: 0;
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

.login-form {
  margin-bottom: var(--spacing-8);
}

.login-button {
  width: 100%;
  margin-top: var(--spacing-4);
}

/* Test Accounts Section */
.test-accounts {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
}

.test-accounts-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-5);
  justify-content: center;
}

.test-accounts-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.account-category {
  margin-bottom: var(--spacing-5);
}

.account-category:last-of-type {
  margin-bottom: var(--spacing-4);
}

.account-category h4 {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 2px solid var(--color-border);
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-2);
}

.test-account {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.test-account:hover {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.account-icon {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
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
  color: var(--color-primary-700);
  background: var(--color-primary-100);
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
  padding: var(--spacing-3);
  background: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  color: var(--color-warning-700);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  text-align: center;
}

.password-note strong {
  color: var(--color-warning-800);
  font-weight: var(--font-weight-semibold);
}

/* Features Section */
.features-section {
  color: white;
  padding: var(--spacing-8) 0;
}

.features-section h2 {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-8);
  color: white;
  text-align: center;
}

.features-grid {
  display: grid;
  gap: var(--spacing-6);
}

.feature-item {
  text-align: center;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-4);
  color: white;
}

.feature-item h3 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-2);
  color: white;
}

.feature-item p {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

@media (max-width: 1023px) {
  .features-section {
    display: none;
  }
}

@media (max-width: 640px) {
  .login-container {
    padding: var(--spacing-4);
  }

  .login-card {
    padding: var(--spacing-6);
  }

  .logo-section {
    flex-direction: column;
    text-align: center;
  }

  .login-header h1 {
    font-size: var(--font-size-2xl);
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
