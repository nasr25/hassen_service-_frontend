<template>
  <AppLayout>
    <div class="user-settings-page">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div>
          <h1>⚙️ {{ $t('userSettings.title') }}</h1>
          <p class="welcome-subtitle">{{ $t('userSettings.subtitle') }}</p>
        </div>
        <button
          @click="saveSettings"
          class="btn-save"
          :disabled="isSaving"
        >
          <svg
            v-if="!isSaving"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          {{ isSaving ? $t('common.saving') : $t('userSettings.saveSettings') }}
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="loading"
      >
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Settings Content -->
      <div
        v-else
        class="settings-content"
      >
        <!-- Email Notifications Settings - Hidden (Always Enabled) -->
        <!-- Email notifications are always enabled and cannot be disabled by users -->

        <!-- In-App Notifications Settings -->
        <div class="settings-card">
          <div class="card-header">
            <div class="header-left">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <div>
                <h2>{{ $t('userSettings.inAppNotifications') }}</h2>
                <p class="card-description">{{ $t('userSettings.inAppNotificationsDesc') }}</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="settings-list">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">{{ $t('userSettings.requestCreated') }}</label>
                  <span class="setting-description">{{ $t('userSettings.requestCreatedDescApp') }}</span>
                </div>
                <div class="toggle-wrapper">
                  <input
                    id="notification-request-created"
                    v-model="settings.notification.request_created"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <label
                    for="notification-request-created"
                    class="toggle-label"
                  ></label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">{{ $t('userSettings.requestStatusChange') }}</label>
                  <span class="setting-description">{{ $t('userSettings.requestStatusChangeDescApp') }}</span>
                </div>
                <div class="toggle-wrapper">
                  <input
                    id="notification-status-change"
                    v-model="settings.notification.request_status_changed"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <label
                    for="notification-status-change"
                    class="toggle-label"
                  ></label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">{{ $t('userSettings.requestAssigned') }}</label>
                  <span class="setting-description">{{ $t('userSettings.requestAssignedDescApp') }}</span>
                </div>
                <div class="toggle-wrapper">
                  <input
                    id="notification-request-assigned"
                    v-model="settings.notification.request_assigned"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <label
                    for="notification-request-assigned"
                    class="toggle-label"
                  ></label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">{{ $t('userSettings.requestApproved') }}</label>
                  <span class="setting-description">{{ $t('userSettings.requestApprovedDescApp') }}</span>
                </div>
                <div class="toggle-wrapper">
                  <input
                    id="notification-request-approved"
                    v-model="settings.notification.request_approved"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <label
                    for="notification-request-approved"
                    class="toggle-label"
                  ></label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">{{ $t('userSettings.requestRejected') }}</label>
                  <span class="setting-description">{{ $t('userSettings.requestRejectedDescApp') }}</span>
                </div>
                <div class="toggle-wrapper">
                  <input
                    id="notification-request-rejected"
                    v-model="settings.notification.request_rejected"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <label
                    for="notification-request-rejected"
                    class="toggle-label"
                  ></label>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">{{ $t('userSettings.requestCompleted') }}</label>
                  <span class="setting-description">{{ $t('userSettings.requestCompletedDescApp') }}</span>
                </div>
                <div class="toggle-wrapper">
                  <input
                    id="notification-request-completed"
                    v-model="settings.notification.request_completed"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <label
                    for="notification-request-completed"
                    class="toggle-label"
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <Transition name="slide-fade">
        <div
          v-if="successMessage"
          class="alert alert-success"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ successMessage }}
        </div>
      </Transition>

      <!-- Error Message -->
      <Transition name="slide-fade">
        <div
          v-if="error && !loading"
          class="alert alert-error-fixed"
        >
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          {{ error }}
        </div>
      </Transition>
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
import { objectToQueryString } from "../services/handle";
import { httpRequest } from "../services/api";
const { t } = useI18n();
const { showSuccess, showError, showConfirm, showDeleteConfirm } = useAlert();
const authStore = useAuthStore();

const loading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const successMessage = ref(null);

const settings = ref({
  email: {
    request_created: true,
    request_status_changed: true,
    request_assigned: true,
    request_approved: true,
    request_rejected: true,
    request_completed: true,
  },
  notification: {
    request_created: true,
    request_status_changed: true,
    request_assigned: true,
    request_approved: true,
    request_rejected: true,
    request_completed: true,
  },
});

const fetchSettings = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await httpRequest("${API_URL}/user/settings");

    if (response.data.settings) {
      settings.value = response.data.settings;
    }
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    // If 404, settings don't exist yet, use defaults
    if (err.response?.status !== 404) {
      showError(t("userSettings.failedToLoad"));
    }
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  try {
    isSaving.value = true;
    successMessage.value = null;
    error.value = null;

    // Ensure email notifications are always enabled
    const settingsToSave = {
      ...settings.value,
      email: {
        request_created: true,
        request_status_changed: true,
        request_assigned: true,
        request_approved: true,
        request_rejected: true,
        request_completed: true,
      },
    };

    await axios.post(
      "${API_URL}/user/settings",
      {
        settings: settingsToSave,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Show success message with icon
    successMessage.value = t("userSettings.savedSuccessfully");

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  } catch (err) {
    console.error("Failed to save settings:", err);
    showError(t("userSettings.failedToSave"));

    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      error.value = null;
    }, 5000);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.user-settings-page {
  max-width: 1000px;
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

.btn-save {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.btn-save:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

html[dir="rtl"] .btn-save {
  flex-direction: row-reverse;
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

.alert-success {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: 1000;
  min-width: 320px;
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
}

html[dir="rtl"] .alert-success {
  right: auto;
  left: var(--spacing-6);
  flex-direction: row-reverse;
}

.alert-error-fixed {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: 1000;
  min-width: 320px;
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
}

html[dir="rtl"] .alert-error-fixed {
  right: auto;
  left: var(--spacing-6);
  flex-direction: row-reverse;
}

/* Slide Fade Animation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Settings Content */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.settings-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all var(--transition-base);
}

.settings-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(34, 197, 94, 0.2);
}

html[dir="rtl"] .settings-card {
  direction: rtl;
}

.card-header {
  padding: var(--spacing-5);
  border-bottom: 2px solid rgba(34, 197, 94, 0.2);
  background: linear-gradient(to bottom, #f0fdf4, #ffffff);
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
}

html[dir="rtl"] .header-left {
  flex-direction: row-reverse;
}

.header-left svg {
  color: #015a4a;
  flex-shrink: 0;
  margin-top: 2px;
}

.card-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: #015a4a;
  margin: 0 0 var(--spacing-1) 0;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.card-body {
  padding: var(--spacing-6);
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

html[dir="rtl"] .setting-item {
  flex-direction: row-reverse;
}

.setting-item:hover {
  background: #f0fdf4;
  border-color: rgba(34, 197, 94, 0.3);
}

.setting-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

html[dir="rtl"] .setting-info {
  align-items: flex-end;
  text-align: right;
}

.setting-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.setting-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Toggle Switch */
.toggle-wrapper {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: block;
  width: 52px;
  height: 28px;
  background: var(--color-border);
  border-radius: 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}

.toggle-label::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.toggle-input:checked + .toggle-label {
  background: #02735e;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(24px);
}

html[dir="rtl"] .toggle-label::after {
  left: auto;
  right: 2px;
}

html[dir="rtl"] .toggle-input:checked + .toggle-label::after {
  transform: translateX(-24px);
}

/* Responsive */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .toggle-wrapper {
    align-self: flex-end;
  }
}
</style>
