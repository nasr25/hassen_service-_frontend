<template>
  <AppLayout>
    <div class="settings-page">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div>
          <h1>⚙️ {{ $t('settings.title') }}</h1>
          <p class="welcome-subtitle">{{ $t('settings.subtitle') }}</p>
        </div>
        <button @click="saveAllSettings" class="btn-save" :disabled="isSaving">
          <svg v-if="!isSaving" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
          </svg>
          {{ isSaving ? $t('settings.saving') : $t('settings.saveAll') }}
        </button>
      </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('settings.loading') }}</p>
    </div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else class="settings-groups">
      <!-- General Settings -->
      <div class="settings-group">
        <h2 class="group-title">🌐 {{ $t('settings.generalSettings') }}</h2>
        <div class="settings-list">
          <div v-for="setting in getGroupSettings('general')" :key="setting.key" class="setting-item">
            <div class="setting-header">
              <label :for="setting.key">{{ formatLabel(setting.key) }}</label>
              <span class="setting-description">{{ setting.description }}</span>
            </div>
            <input
              v-if="setting.type === 'text' || setting.type === 'number'"
              :id="setting.key"
              v-model="settingsData[setting.key]"
              :type="setting.type === 'number' ? 'number' : 'text'"
              class="form-input"
            />
            <div v-else-if="setting.type === 'boolean'" class="toggle-wrapper">
              <input
                :id="setting.key"
                v-model="settingsData[setting.key]"
                type="checkbox"
                class="toggle-input"
              />
              <label :for="setting.key" class="toggle-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- Appearance Settings -->
      <div class="settings-group">
        <h2 class="group-title">🎨 {{ $t('settings.appearanceSettings') }}</h2>
        <div class="settings-list">
          <!-- Logo Upload -->
          <div class="setting-item">
            <div class="setting-header">
              <label>{{ $t('settings.websiteLogo') }}</label>
              <span class="setting-description">{{ $t('settings.logoDescription') }}</span>
            </div>
            <div class="image-upload-wrapper">
              <div v-if="logoPreview" class="image-preview">
                <img :src="logoPreview" :alt="$t('settings.logoPreview')" />
                <button @click="removeLogo" class="btn-remove">{{ $t('settings.remove') }}</button>
              </div>
              <input
                type="file"
                ref="logoInput"
                @change="handleLogoUpload"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                class="file-input"
              />
              <button @click="$refs.logoInput.click()" class="btn-secondary">
                {{ $t('settings.chooseLogo') }}
              </button>
            </div>
          </div>

          <!-- Favicon Upload -->
          <div class="setting-item">
            <div class="setting-header">
              <label>{{ $t('settings.websiteFavicon') }}</label>
              <span class="setting-description">{{ $t('settings.faviconDescription') }}</span>
            </div>
            <div class="image-upload-wrapper">
              <div v-if="faviconPreview" class="image-preview">
                <img :src="faviconPreview" :alt="$t('settings.faviconPreview')" />
                <button @click="removeFavicon" class="btn-remove">{{ $t('settings.remove') }}</button>
              </div>
              <input
                type="file"
                ref="faviconInput"
                @change="handleFaviconUpload"
                accept="image/png,image/x-icon,image/svg+xml,image/webp"
                class="file-input"
              />
              <button @click="$refs.faviconInput.click()" class="btn-secondary">
                {{ $t('settings.chooseFavicon') }}
              </button>
            </div>
          </div>

          <!-- Color Pickers -->
          <div v-for="setting in getGroupSettings('appearance').filter(s => s.type === 'text' && s.key.includes('color'))"
               :key="setting.key"
               class="setting-item">
            <div class="setting-header">
              <label :for="setting.key">{{ formatLabel(setting.key) }}</label>
              <span class="setting-description">{{ setting.description }}</span>
            </div>
            <div class="color-input-wrapper">
              <input
                :id="setting.key"
                v-model="settingsData[setting.key]"
                type="color"
                class="color-input"
              />
              <input
                v-model="settingsData[setting.key]"
                type="text"
                class="form-input color-text"
                placeholder="#005028"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div class="settings-group">
        <h2 class="group-title">⚡ {{ $t('settings.systemSettings') }}</h2>
        <div class="settings-list">
          <div v-for="setting in getGroupSettings('system')" :key="setting.key" class="setting-item">
            <div class="setting-header">
              <label :for="setting.key">{{ formatLabel(setting.key) }}</label>
              <span class="setting-description">{{ setting.description }}</span>
            </div>
            <input
              v-if="setting.type === 'text' || setting.type === 'number'"
              :id="setting.key"
              v-model="settingsData[setting.key]"
              :type="setting.type === 'number' ? 'number' : 'text'"
              class="form-input"
            />
            <div v-else-if="setting.type === 'boolean'" class="toggle-wrapper">
              <input
                :id="setting.key"
                v-model="settingsData[setting.key]"
                type="checkbox"
                class="toggle-input"
              />
              <label :for="setting.key" class="toggle-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Settings -->
      <div class="settings-group">
        <h2 class="group-title">✨ {{ $t('settings.featuresSettings') }}</h2>
        <div class="settings-list">
          <div v-for="setting in getGroupSettings('features')" :key="setting.key" class="setting-item">
            <div class="setting-header">
              <label :for="setting.key">{{ formatLabel(setting.key) }}</label>
              <span class="setting-description">{{ setting.description }}</span>
            </div>
            <div class="toggle-wrapper">
              <input
                :id="setting.key"
                v-model="settingsData[setting.key]"
                type="checkbox"
                class="toggle-input"
              />
              <label :for="setting.key" class="toggle-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Settings -->
      <div class="settings-group">
        <h2 class="group-title">📄 {{ $t('settings.footerSettings') }}</h2>
        <div class="settings-list">
          <div v-for="setting in getGroupSettings('footer')" :key="setting.key" class="setting-item">
            <div class="setting-header">
              <label :for="setting.key">{{ formatLabel(setting.key) }}</label>
              <span class="setting-description">{{ setting.description }}</span>
            </div>
            <textarea
              v-if="setting.type === 'text'"
              :id="setting.key"
              v-model="settingsData[setting.key]"
              class="form-textarea"
              rows="2"
            ></textarea>
            <div v-else-if="setting.type === 'boolean'" class="toggle-wrapper">
              <input
                :id="setting.key"
                v-model="settingsData[setting.key]"
                type="checkbox"
                class="toggle-input"
              />
              <label :for="setting.key" class="toggle-label"></label>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Templates Settings -->
      <div class="settings-group">
        <h2 class="group-title">📧 {{ $t('settings.emailTemplates') }}</h2>
        <div v-if="emailConfig && !emailConfig.configured" class="alert alert-warning">
          ⚠️ {{ $t('settings.emailNotConfigured') }}
        </div>
        <div v-if="emailTemplatesError" class="alert alert-error">
          {{ emailTemplatesError }}
        </div>
        <div v-if="loadingTemplates" class="loading">
          <div class="spinner"></div>
          <p>{{ $t('settings.loadingTemplates') }}</p>
        </div>
        <div v-else-if="emailTemplates.length === 0" class="alert alert-warning">
          {{ $t('settings.noTemplatesFound') }}
        </div>
        <div v-else class="email-templates-list">
          <div v-for="template in emailTemplates" :key="template.id" class="template-card">
            <div class="template-header">
              <div class="template-info">
                <h3 class="template-title">{{ formatEventType(template.event_type) }}</h3>
                <p class="template-description">{{ template.description }}</p>
              </div>
              <div class="template-actions">
                <button
                  @click="toggleTemplateStatus(template)"
                  :class="['btn-toggle', template.is_active ? 'active' : 'inactive']"
                  :title="template.is_active ? $t('common.deactivate') : $t('common.activate')"
                >
                  {{ template.is_active ? `✓ ${$t('settings.active')}` : `✗ ${$t('settings.inactive')}` }}
                </button>
                <button @click="openTemplateEditor(template)" class="btn-icon-action" :title="$t('common.edit')">
                  ✏️ {{ $t('common.edit') }}
                </button>
                <button @click="openTestEmailModal(template)" class="btn-icon-action" :title="$t('settings.test')">
                  📧 {{ $t('settings.test') }}
                </button>
              </div>
            </div>
            <div class="template-preview">
              <div class="template-lang">
                <strong>{{ $t('settings.englishShort') }}:</strong> {{ template.subject_en }}
              </div>
              <div class="template-lang">
                <strong>{{ $t('settings.arabicShort') }}:</strong> {{ template.subject_ar }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Template Editor Modal -->
    <div v-if="templateEditorModal.show" class="modal-overlay" @click="closeTemplateEditor">
      <div class="modal-content modal-large" @click.stop>
        <h2>✏️ {{ $t('settings.editEmailTemplate') }}</h2>
        <p class="template-event-type">{{ formatEventType(templateEditorModal.template?.event_type) }}</p>

        <div class="template-editor">
          <!-- English Version -->
          <div class="template-section">
            <h3>{{ $t('settings.english') }}</h3>
            <div class="form-group">
              <label>{{ $t('settings.subject') }} ({{ $t('settings.english') }})</label>
              <input
                v-model="templateEditorModal.form.subject_en"
                type="text"
                class="form-input"
                placeholder="Email subject..."
              />
            </div>
            <div class="form-group">
              <label>{{ $t('settings.body') }} ({{ $t('settings.english') }})</label>
              <textarea
                v-model="templateEditorModal.form.body_en"
                rows="10"
                class="form-textarea"
                placeholder="Email body..."
              ></textarea>
            </div>
          </div>

          <!-- Arabic Version -->
          <div class="template-section">
            <h3>{{ $t('settings.arabic') }}</h3>
            <div class="form-group">
              <label>{{ $t('settings.subject') }} ({{ $t('settings.arabic') }})</label>
              <input
                v-model="templateEditorModal.form.subject_ar"
                type="text"
                class="form-input"
                placeholder="موضوع البريد..."
                dir="rtl"
              />
            </div>
            <div class="form-group">
              <label>{{ $t('settings.body') }} ({{ $t('settings.arabic') }})</label>
              <textarea
                v-model="templateEditorModal.form.body_ar"
                rows="10"
                class="form-textarea"
                placeholder="نص البريد..."
                dir="rtl"
              ></textarea>
            </div>
          </div>

          <!-- Available Placeholders -->
          <div class="placeholders-info">
            <h4>📝 {{ $t('settings.availablePlaceholders') }}:</h4>
            <div class="placeholders-list">
              <span
                v-for="(desc, placeholder) in templateEditorModal.template?.available_placeholders"
                :key="placeholder"
                class="placeholder-tag"
                :title="desc"
              >
                {{ placeholder }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeTemplateEditor" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveTemplate" :disabled="templateEditorModal.isSaving" class="btn-primary">
            {{ templateEditorModal.isSaving ? $t('common.saving') : $t('settings.saveTemplate') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Test Email Modal -->
    <div v-if="testEmailModal.show" class="modal-overlay" @click="closeTestEmailModal">
      <div class="modal-content" @click.stop>
        <h2>📧 {{ $t('settings.sendTestEmail') }}</h2>
        <p class="template-event-type">{{ formatEventType(testEmailModal.template?.event_type) }}</p>

        <div class="form-group">
          <label>{{ $t('settings.recipientEmail') }}</label>
          <input
            v-model="testEmailModal.email"
            type="email"
            class="form-input"
            placeholder="test@example.com"
          />
        </div>

        <div class="form-group">
          <label>{{ $t('settings.language') }}</label>
          <select v-model="testEmailModal.language" class="form-input">
            <option value="en">{{ $t('settings.english') }}</option>
            <option value="ar">{{ $t('settings.arabic') }}</option>
          </select>
        </div>

        <div v-if="testEmailModal.success" class="alert alert-success">
          ✓ {{ $t('settings.testEmailSuccess') }}
        </div>
        <div v-if="testEmailModal.error" class="alert alert-error">
          ✗ {{ testEmailModal.error }}
        </div>

        <div class="modal-actions">
          <button @click="closeTestEmailModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="sendTestEmail" :disabled="testEmailModal.isSending" class="btn-primary">
            {{ testEmailModal.isSending ? $t('common.submitting') : $t('settings.sendTestEmail') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Bottom Save Button (Sticky) -->
    <div class="bottom-save-bar">
      <div class="bottom-save-content">
        <div class="bottom-save-info">
          <span class="changes-indicator" v-if="!isSaving">💾 {{ $t('settings.makeChangesHint') }}</span>
          <span class="changes-indicator" v-else>⏳ {{ $t('settings.savingChanges') }}</span>
        </div>
        <button @click="saveAllSettings" class="btn-primary btn-large" :disabled="isSaving">
          <svg v-if="!isSaving" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
          </svg>
          {{ isSaving ? $t('settings.savingChanges') : $t('settings.saveAllChanges') }}
        </button>
      </div>
    </div>
  </div>
</AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import AppLayout from '../../components/AppLayout.vue'
import { API_URL, BASE_URL } from '../../config/api'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const successMessage = ref(null)

const allSettings = ref([])
const settingsData = ref({})

const logoInput = ref(null)
const faviconInput = ref(null)
const logoPreview = ref(null)
const faviconPreview = ref(null)
const logoFile = ref(null)
const faviconFile = ref(null)

// Email Templates
const emailTemplates = ref([])
const loadingTemplates = ref(false)
const emailConfig = ref(null)
const emailTemplatesError = ref(null)
const templateEditorModal = ref({
  show: false,
  isSaving: false,
  template: null,
  form: {
    subject_en: '',
    subject_ar: '',
    body_en: '',
    body_ar: ''
  }
})
const testEmailModal = ref({
  show: false,
  isSending: false,
  template: null,
  email: '',
  language: 'ar',
  success: false,
  error: null
})

// Fetch all settings
const fetchSettings = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await axios.get(`${API_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (response.data.settings) {
      // Flatten the grouped settings
      allSettings.value = []
      Object.keys(response.data.settings).forEach(group => {
        allSettings.value.push(...response.data.settings[group])
      })

      // Populate settingsData
      allSettings.value.forEach(setting => {
        settingsData.value[setting.key] = castValue(setting.value, setting.type)
      })

      // Set image previews
      if (settingsData.value.logo) {
        logoPreview.value = `${BASE_URL}/storage/${settingsData.value.logo}`
      }
      if (settingsData.value.favicon) {
        faviconPreview.value = `${BASE_URL}/storage/${settingsData.value.favicon}`
      }
    }
  } catch (err) {
    console.error('Failed to fetch settings:', err)
    error.value = t('settings.failedToLoad')
  } finally {
    loading.value = false
  }
}

// Cast value based on type
const castValue = (value, type) => {
  switch (type) {
    case 'boolean':
      return value === true || value === 'true' || value === '1'
    case 'number':
      return parseFloat(value) || 0
    case 'json':
      return typeof value === 'string' ? JSON.parse(value) : value
    default:
      return value
  }
}

// Get settings by group
const getGroupSettings = (group) => {
  return allSettings.value.filter(s => s.group === group)
}

// Format setting key to readable label using translations
const formatLabel = (key) => {
  // Try to get translation first, fallback to formatted key if not found
  const translationKey = `settings.fields.${key}`
  const translated = t(translationKey)

  // If translation doesn't exist, it returns the key itself, so we check for that
  if (translated === translationKey) {
    // Fallback to formatted label
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  }

  return translated
}

// Handle logo upload
const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Handle favicon upload
const handleFaviconUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    faviconFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      faviconPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Remove logo
const removeLogo = async () => {
  try {
    logoPreview.value = null
    logoFile.value = null
    settingsData.value.logo = null

    // Delete the logo from backend
    await axios.delete(`${API_URL}/settings/logo`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
  } catch (err) {
    console.error('Failed to delete logo:', err)
  }
}

// Remove favicon
const removeFavicon = async () => {
  try {
    faviconPreview.value = null
    faviconFile.value = null
    settingsData.value.favicon = null

    // Delete the favicon from backend
    await axios.delete(`${API_URL}/settings/favicon`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
  } catch (err) {
    console.error('Failed to delete favicon:', err)
  }
}

// Save all settings
const saveAllSettings = async () => {
  try {
    isSaving.value = true
    successMessage.value = null
    error.value = null

    // Upload logo if changed
    if (logoFile.value) {
      const formData = new FormData()
      formData.append('key', 'logo')
      formData.append('image', logoFile.value)

      const response = await axios.post(`${API_URL}/settings/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update preview immediately with uploaded image URL
      if (response.data.url) {
        logoPreview.value = `${BASE_URL}${response.data.url}`
        settingsData.value.logo = response.data.setting.value
      }
    }

    // Upload favicon if changed
    if (faviconFile.value) {
      const formData = new FormData()
      formData.append('key', 'favicon')
      formData.append('image', faviconFile.value)

      const response = await axios.post(`${API_URL}/settings/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update preview immediately with uploaded image URL
      if (response.data.url) {
        faviconPreview.value = `${BASE_URL}${response.data.url}`
        settingsData.value.favicon = response.data.setting.value
      }
    }

    // Update text settings
    const settingsToUpdate = []
    Object.keys(settingsData.value).forEach(key => {
      // Skip image settings as they're handled separately
      if (key !== 'logo' && key !== 'favicon') {
        settingsToUpdate.push({
          key: key,
          value: settingsData.value[key]
        })
      }
    })

    await axios.put(`${API_URL}/settings/bulk`, {
      settings: settingsToUpdate
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    successMessage.value = t('settings.savedSuccessfully')

    // Clear file references
    logoFile.value = null
    faviconFile.value = null

    // Refresh settings
    await fetchSettings()

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Failed to save settings:', err)
    error.value = t('settings.failedToSave')
  } finally {
    isSaving.value = false
  }
}

// Email Templates Functions
const fetchEmailTemplates = async () => {
  try {
    loadingTemplates.value = true
    emailTemplatesError.value = null

    console.log('Fetching email templates...')
    console.log('Auth token:', authStore.token ? 'Present' : 'Missing')

    const [templatesRes, configRes] = await Promise.all([
      axios.get(`${API_URL}/email-templates`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }),
      axios.get(`${API_URL}/email-templates/config`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    ])

    console.log('Templates response:', templatesRes.data)
    console.log('Config response:', configRes.data)

    emailTemplates.value = templatesRes.data.templates || []
    emailConfig.value = configRes.data
  } catch (err) {
    console.error('Failed to fetch email templates:', err)
    console.error('Error response:', err.response)

    if (err.response?.status === 401) {
      emailTemplatesError.value = t('settings.authRequired')
    } else if (err.response?.status === 403) {
      emailTemplatesError.value = t('settings.accessDenied')
    } else {
      emailTemplatesError.value = `${t('settings.failedToLoadTemplates')}: ${err.message}`
    }
  } finally {
    loadingTemplates.value = false
  }
}

const formatEventType = (eventType) => {
  return eventType
    .replace('request.', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

const openTemplateEditor = (template) => {
  templateEditorModal.value = {
    show: true,
    isSaving: false,
    template: template,
    form: {
      subject_en: template.subject_en,
      subject_ar: template.subject_ar,
      body_en: template.body_en,
      body_ar: template.body_ar
    }
  }
}

const closeTemplateEditor = () => {
  templateEditorModal.value.show = false
}

const saveTemplate = async () => {
  try {
    templateEditorModal.value.isSaving = true

    await axios.put(
      `${API_URL}/email-templates/${templateEditorModal.value.template.id}`,
      templateEditorModal.value.form,
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    )

    successMessage.value = t('settings.templateUpdatedSuccess')
    closeTemplateEditor()
    await fetchEmailTemplates()

    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Failed to save template:', err)
    error.value = t('settings.failedToSaveTemplate')
  } finally {
    templateEditorModal.value.isSaving = false
  }
}

const toggleTemplateStatus = async (template) => {
  try {
    await axios.post(
      `${API_URL}/email-templates/${template.id}/toggle-status`,
      {},
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    )

    successMessage.value = template.is_active ? t('settings.templateDisabled') : t('settings.templateEnabled')
    await fetchEmailTemplates()

    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Failed to toggle template status:', err)
    error.value = t('settings.failedToToggleStatus')
  }
}

const openTestEmailModal = (template) => {
  testEmailModal.value = {
    show: true,
    isSending: false,
    template: template,
    email: authStore.user?.email || '',
    language: 'ar',
    success: false,
    error: null
  }
}

const closeTestEmailModal = () => {
  testEmailModal.value.show = false
}

const sendTestEmail = async () => {
  try {
    testEmailModal.value.isSending = true
    testEmailModal.value.success = false
    testEmailModal.value.error = null

    await axios.post(
      `${API_URL}/email-templates/${testEmailModal.value.template.id}/send-test`,
      {
        recipient_email: testEmailModal.value.email,
        language: testEmailModal.value.language
      },
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    )

    testEmailModal.value.success = true

    setTimeout(() => {
      closeTestEmailModal()
    }, 2000)
  } catch (err) {
    console.error('Failed to send test email:', err)
    testEmailModal.value.error = err.response?.data?.message || 'Failed to send test email'
  } finally {
    testEmailModal.value.isSending = false
  }
}

onMounted(() => {
  fetchSettings()
  fetchEmailTemplates()
})
</script>

<style scoped>
.settings-page {
  max-width: 1400px;
  margin: 0 auto;
  direction: inherit;
}

/* Welcome Section - Green gradient like dashboard */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, #084 0%, #66a459 100%);
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

/* RTL Support for save button */
html[dir="rtl"] .btn-save {
  flex-direction: row-reverse;
}

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
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  background: #efe;
  color: #3c3;
  border: 1px solid #cfc;
  position: fixed;
  top: var(--spacing-4);
  right: var(--spacing-4);
  z-index: 1000;
  min-width: 300px;
}

/* RTL Support for alert */
html[dir="rtl"] .alert-success {
  right: auto;
  left: var(--spacing-4);
}

.settings-groups {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.settings-group {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.settings-group:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(34, 197, 94, 0.2);
}

/* RTL Support for settings group */
html[dir="rtl"] .settings-group {
  direction: rtl;
}

.group-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: #16a34a;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 2px solid rgba(34, 197, 94, 0.2);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.setting-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.setting-header label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.setting-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* RTL Support for setting items */
html[dir="rtl"] .setting-item {
  text-align: right;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.color-input-wrapper {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

/* RTL Support for color input */
html[dir="rtl"] .color-input-wrapper {
  flex-direction: row-reverse;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.color-text {
  flex: 1;
  max-width: 200px;
}

.toggle-wrapper {
  position: relative;
  display: inline-block;
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
  content: '';
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
  background: #22c55e;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(24px);
}

/* RTL Support for toggle */
html[dir="rtl"] .toggle-label::after {
  left: auto;
  right: 2px;
}

html[dir="rtl"] .toggle-input:checked + .toggle-label::after {
  transform: translateX(-24px);
}

.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.image-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

/* RTL Support for image preview */
html[dir="rtl"] .image-preview {
  flex-direction: row-reverse;
}

.image-preview img {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.file-input {
  display: none;
}

.btn-primary,
.btn-secondary,
.btn-remove {
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  font-size: var(--font-size-sm);
}

.btn-primary {
  background: #22c55e;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border);
}

.btn-remove {
  background: #fee;
  color: #c33;
}

.btn-remove:hover {
  background: #fcc;
}

/* Bottom Save Bar */
.bottom-save-bar {
  background: #16a34a;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-4) var(--spacing-6);
  margin-top: var(--spacing-8);
}

.bottom-save-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* RTL Support for bottom save bar */
html[dir="rtl"] .bottom-save-content {
  direction: rtl;
}

html[dir="rtl"] .bottom-save-info {
  flex-direction: row-reverse;
}

.bottom-save-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.changes-indicator {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.btn-large {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-md);
  background: white;
  color: #16a34a;
  font-weight: var(--font-weight-semibold);
}

/* RTL Support for large button */
html[dir="rtl"] .btn-large {
  flex-direction: row-reverse;
}

.btn-large:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.2);
}

.btn-large svg {
  flex-shrink: 0;
}

/* Email Templates Styles */
.email-templates-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.template-card {
  background: white;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-5);
  transition: all var(--transition-base);
}

.template-card:hover {
  border-color: #22c55e;
  box-shadow: var(--shadow-md);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
}

.template-info {
  flex: 1;
}

.template-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.template-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.template-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.btn-toggle {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-lg);
  border: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-toggle.active {
  background: #d1e7dd;
  color: #0f5132;
}

.btn-toggle.inactive {
  background: #f8d7da;
  color: #842029;
}

.btn-icon-action {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon-action:hover {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.template-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border);
}

.template-lang {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.template-lang strong {
  color: var(--color-text-primary);
  margin-right: var(--spacing-2);
}

.template-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
  margin: var(--spacing-6) 0;
}

.template-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.template-section h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: #16a34a;
  margin: 0;
}

.placeholders-info {
  grid-column: 1 / -1;
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.placeholders-info h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-3) 0;
}

.placeholders-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.placeholder-tag {
  padding: var(--spacing-1) var(--spacing-3);
  background: #22c55e;
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-family: 'Courier New', monospace;
  cursor: help;
}

.template-event-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-2) 0 var(--spacing-4) 0;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  display: inline-block;
}

.modal-large {
  max-width: 900px;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-primary);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-6);
}

.modal-actions button {
  flex: 1;
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* RTL Support for email templates */
html[dir="rtl"] .template-header {
  flex-direction: row-reverse;
}

html[dir="rtl"] .template-actions {
  flex-direction: row-reverse;
}

html[dir="rtl"] .template-lang strong {
  margin-right: 0;
  margin-left: var(--spacing-2);
}

html[dir="rtl"] .modal-actions {
  flex-direction: row-reverse;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bottom-save-content {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .btn-large {
    width: 100%;
    justify-content: center;
  }

  .template-editor {
    grid-template-columns: 1fr;
  }

  .template-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .template-actions {
    width: 100%;
  }
}
</style>
