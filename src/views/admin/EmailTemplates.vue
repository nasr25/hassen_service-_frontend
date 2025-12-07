<template>
  <AppLayout>
    <div class="email-templates">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>📧 {{ $t('admin.emailTemplates') }}</h1>
          <p class="page-subtitle">{{ $t('admin.emailTemplatesSubtitle') }}</p>
        </div>
        <button @click="refresh" class="btn-refresh">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          {{ $t('common.refresh') }}
        </button>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'user' }]"
          @click="activeTab = 'user'"
        >
          👥 {{ $t('admin.userTemplates') }}
          <span class="tab-badge">{{ userTemplates.length }}</span>
        </button>
        <button
          :class="['tab', { active: activeTab === 'admin' }]"
          @click="activeTab = 'admin'"
        >
          🔐 {{ $t('admin.adminTemplates') }}
          <span class="tab-badge badge-admin">{{ adminTemplates.length }}</span>
        </button>
        <button
          :class="['tab', { active: activeTab === 'manager' }]"
          @click="activeTab = 'manager'"
        >
          👔 {{ $t('admin.managerTemplates') }}
          <span class="tab-badge badge-manager">{{ managerTemplates.length }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>

      <!-- Templates List -->
      <div v-else class="templates-container">
        <div class="templates-grid">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="template-card"
          >
            <div class="template-header">
              <div>
                <span :class="['recipient-badge', `badge-${template.recipient_type}`]">
                  {{ $t(`admin.${template.recipient_type}`) }}
                </span>
                <span :class="['status-badge', template.is_active ? 'active' : 'inactive']">
                  {{ template.is_active ? $t('admin.active') : $t('admin.inactive') }}
                </span>
              </div>
              <div class="template-actions">
                <button
                  @click="openEditModal(template)"
                  class="btn-icon"
                  :title="$t('common.edit')"
                >
                  ✏️
                </button>
                <button
                  @click="openTestEmailModal(template)"
                  class="btn-icon"
                  :title="$t('admin.sendTestEmail')"
                >
                  📤
                </button>
                <button
                  @click="toggleTemplateStatus(template)"
                  class="btn-icon"
                  :title="template.is_active ? $t('admin.deactivate') : $t('admin.activate')"
                >
                  {{ template.is_active ? '⏸️' : '▶️' }}
                </button>
              </div>
            </div>

            <div class="template-body">
              <div class="template-event">
                <code>{{ $t(template.event_type) }}</code>
              </div>
              <div class="template-description">
                {{ template.description }}
              </div>
              <div class="template-subjects">
                <div class="subject-line">
                  <span class="lang-label">{{ $t('common.english') }}:</span>
                  <span class="subject-text">{{ template.subject_en }}</span>
                </div>
                <div class="subject-line">
                  <span class="lang-label">{{ $t('common.arabic') }}:</span>
                  <span class="subject-text">{{ template.subject_ar }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTemplates.length === 0" class="empty-state">
          <p>{{ $t('admin.noTemplatesFound') }}</p>
        </div>
      </div>

      <!-- Edit Template Modal -->
      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content modal-large" @click.stop>
          <div class="modal-header">
            <h2>{{ $t('admin.editTemplate') }}</h2>
            <button @click="closeEditModal" class="btn-close">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">{{ $t('admin.eventType') }}</label>
              <input
                v-model="editForm.event_type"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('admin.recipientType') }}</label>
              <select v-model="editForm.recipient_type" class="form-input" disabled>
                <option value="user">{{ $t('admin.user') }}</option>
                <option value="admin">{{ $t('admin.admin') }}</option>
                <option value="manager">{{ $t('admin.manager') }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('admin.description') }}</label>
              <textarea
                v-model="editForm.description"
                class="form-textarea"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ $t('admin.subjectEnglish') }}
              </label>
              <input
                v-model="editForm.subject_en"
                type="text"
                class="form-input"
                :placeholder="$t('admin.subjectEnglishPlaceholder')"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ $t('admin.subjectArabic') }}
              </label>
              <input
                v-model="editForm.subject_ar"
                type="text"
                class="form-input"
                dir="rtl"
                :placeholder="$t('admin.subjectArabicPlaceholder')"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ $t('admin.bodyEnglish') }}
                <button @click="copyPlaceholders" class="btn-link">
                  📋 {{ $t('admin.copyPlaceholders') }}
                </button>
              </label>
              <textarea
                v-model="editForm.body_en"
                class="form-textarea"
                rows="8"
                :placeholder="$t('admin.bodyEnglishPlaceholder')"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                {{ $t('admin.bodyArabic') }}
              </label>
              <textarea
                v-model="editForm.body_ar"
                class="form-textarea"
                rows="8"
                dir="rtl"
                :placeholder="$t('admin.bodyArabicPlaceholder')"
              ></textarea>
            </div>

            <div class="placeholders-info">
              <strong>{{ $t('admin.availablePlaceholders') }}:</strong>
              <div class="placeholders-grid">
                <code>{user_name}</code>
                <code>{request_id}</code>
                <code>{request_title}</code>
                <code>{status}</code>
                <code>{department}</code>
                <code>{created_at}</code>
                <code>{employee_name}</code>
                <code>{assigned_by}</code>
              </div>
            </div>

            <div class="form-group-inline">
              <input
                v-model="editForm.is_active"
                type="checkbox"
                id="is_active"
                class="form-checkbox"
              />
              <label for="is_active" class="checkbox-label">
                {{ $t('admin.templateActive') }}
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeEditModal" class="btn-secondary">
              {{ $t('common.cancel') }}
            </button>
            <button @click="saveTemplate" class="btn-primary">
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Test Email Modal -->
      <div v-if="showTestEmailModal" class="modal-overlay" @click="closeTestEmailModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ $t('admin.sendTestEmail') }}</h2>
            <button @click="closeTestEmailModal" class="btn-close">×</button>
          </div>

          <div class="modal-body">
            <p class="modal-subtitle">
              {{ $t('admin.testEmailSubtitle') }}
            </p>

            <div class="form-group">
              <label class="form-label">{{ $t('admin.testEmailAddress') }}</label>
              <input
                v-model="testEmail.email"
                type="email"
                class="form-input"
                :placeholder="$t('admin.testEmailPlaceholder')"
              />
            </div>

            <div class="template-preview">
              <div class="preview-item">
                <strong>{{ $t('admin.subject') }}:</strong>
                <p>{{ testEmail.template?.subject_en }}</p>
              </div>
              <div class="preview-item">
                <strong>{{ $t('admin.body') }}:</strong>
                <pre>{{ testEmail.template?.body_en }}</pre>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeTestEmailModal" class="btn-secondary">
              {{ $t('common.cancel') }}
            </button>
            <button @click="sendTestEmail" class="btn-primary" :disabled="!testEmail.email">
              {{ $t('admin.send') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import AppLayout from '../../components/AppLayout.vue'
import { API_URL } from '../../config/api'

const { t } = useI18n()
const authStore = useAuthStore()

const activeTab = ref('user')
const templates = ref([])
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const showEditModal = ref(false)
const showTestEmailModal = ref(false)

const editForm = ref({
  id: null,
  event_type: '',
  recipient_type: 'user',
  subject_en: '',
  subject_ar: '',
  body_en: '',
  body_ar: '',
  description: '',
  is_active: true
})

const testEmail = ref({
  template: null,
  email: ''
})

// Computed properties
const userTemplates = computed(() =>
  templates.value.filter(t => t.recipient_type === 'user')
)

const adminTemplates = computed(() =>
  templates.value.filter(t => t.recipient_type === 'admin')
)

const managerTemplates = computed(() =>
  templates.value.filter(t => t.recipient_type === 'manager')
)

const filteredTemplates = computed(() => {
  switch (activeTab.value) {
    case 'user':
      return userTemplates.value
    case 'admin':
      return adminTemplates.value
    case 'manager':
      return managerTemplates.value
    default:
      return []
  }
})

// Methods
const fetchTemplates = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await axios.get(`${API_URL}/email-templates`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    templates.value = response.data.templates || []
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToFetch')
  } finally {
    isLoading.value = false
  }
}

const refresh = () => {
  fetchTemplates()
}

const openEditModal = (template) => {
  editForm.value = {
    id: template.id,
    event_type: template.event_type,
    recipient_type: template.recipient_type,
    subject_en: template.subject_en,
    subject_ar: template.subject_ar,
    body_en: template.body_en,
    body_ar: template.body_ar,
    description: template.description,
    is_active: template.is_active
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    id: null,
    event_type: '',
    recipient_type: 'user',
    subject_en: '',
    subject_ar: '',
    body_en: '',
    body_ar: '',
    description: '',
    is_active: true
  }
}

const saveTemplate = async () => {
  error.value = ''
  success.value = ''

  try {
    await axios.put(`${API_URL}/email-templates/${editForm.value.id}`, editForm.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.templateUpdated')
    closeEditModal()
    fetchTemplates()
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToUpdate')
  }
}

const toggleTemplateStatus = async (template) => {
  try {
    await axios.put(`${API_URL}/email-templates/${template.id}`, {
      ...template,
      is_active: !template.is_active
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.statusUpdated')
    fetchTemplates()
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToUpdate')
  }
}

const openTestEmailModal = (template) => {
  testEmail.value = {
    template: template,
    email: ''
  }
  showTestEmailModal.value = true
}

const closeTestEmailModal = () => {
  showTestEmailModal.value = false
  testEmail.value = {
    template: null,
    email: ''
  }
}

const sendTestEmail = async () => {
  error.value = ''
  success.value = ''

  try {
    await axios.post(`${API_URL}/email-templates/${testEmail.value.template.id}/test`, {
      email: testEmail.value.email
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.testEmailSent')
    closeTestEmailModal()
  } catch (err) {
    error.value = err.response?.data?.message || t('messages.error.failedToSend')
  }
}

const copyPlaceholders = () => {
  const placeholders = '{user_name}, {request_id}, {request_title}, {status}, {department}, {created_at}, {employee_name}, {assigned_by}'
  navigator.clipboard.writeText(placeholders)
  success.value = t('messages.success.copiedToClipboard')
  setTimeout(() => {
    success.value = ''
  }, 2000)
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.email-templates {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: var(--color-text-secondary, #666);
  font-size: 16px;
  margin: 0;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary, #10b981);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: var(--color-primary-dark, #059669);
  transform: translateY(-1px);
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.alert-success {
  background: #efe;
  color: #060;
  border: 1px solid #cfc;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary, #666);
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: var(--color-primary, #10b981);
  background: rgba(16, 185, 129, 0.05);
}

.tab.active {
  color: var(--color-primary, #10b981);
  border-bottom-color: var(--color-primary, #10b981);
}

.tab-badge {
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-badge.badge-admin {
  background: #ef4444;
}

.tab-badge.badge-manager {
  background: #06b6d4;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #666);
  font-size: 16px;
}

.templates-container {
  min-height: 400px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.template-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.recipient-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
}

.recipient-badge.badge-user {
  background: #10b981;
  color: white;
}

.recipient-badge.badge-admin {
  background: #ef4444;
  color: white;
}

.recipient-badge.badge-manager {
  background: #06b6d4;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.template-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  padding: 6px 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f9fafb;
  transform: scale(1.05);
}

.template-body {
  padding: 16px;
}

.template-event {
  margin-bottom: 12px;
}

.template-event code {
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #1f2937;
  font-family: 'Monaco', 'Courier New', monospace;
}

.template-description {
  color: var(--color-text-secondary, #666);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.template-subjects {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subject-line {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.lang-label {
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  min-width: 30px;
}

.subject-text {
  color: var(--color-text-primary, #1a1a1a);
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-secondary, #666);
  font-size: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary, #666);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: var(--color-text-primary, #1a1a1a);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-subtitle {
  color: var(--color-text-secondary, #666);
  font-size: 14px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #1a1a1a);
  margin-bottom: 8px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary, #10b981);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-link:hover {
  background: rgba(16, 185, 129, 0.1);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #10b981);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  font-family: 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
}

.form-group-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: var(--color-text-primary, #1a1a1a);
  cursor: pointer;
  user-select: none;
}

.placeholders-info {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

.placeholders-info strong {
  display: block;
  margin-bottom: 12px;
  color: var(--color-text-primary, #1a1a1a);
  font-size: 14px;
}

.placeholders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.placeholders-grid code {
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  font-family: 'Monaco', 'Courier New', monospace;
}

.template-preview {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.preview-item {
  margin-bottom: 16px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item strong {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-primary, #1a1a1a);
  font-size: 14px;
}

.preview-item p {
  margin: 0;
  color: var(--color-text-secondary, #666);
  font-size: 14px;
}

.preview-item pre {
  margin: 0;
  color: var(--color-text-secondary, #666);
  font-size: 13px;
  white-space: pre-wrap;
  font-family: 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: var(--color-text-primary, #1a1a1a);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: var(--color-primary, #10b981);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark, #059669);
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
}
</style>
