<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1>⚙️ Settings Management</h1>
        <p class="subtitle">Configure website settings and appearance</p>
      </div>
      <button @click="saveAllSettings" class="btn-primary" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save All Changes' }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading settings...</p>
    </div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else class="settings-groups">
      <!-- General Settings -->
      <div class="settings-group">
        <h2 class="group-title">🌐 General Settings</h2>
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
        <h2 class="group-title">🎨 Appearance Settings</h2>
        <div class="settings-list">
          <!-- Logo Upload -->
          <div class="setting-item">
            <div class="setting-header">
              <label>Website Logo</label>
              <span class="setting-description">Upload your website logo (PNG, JPG, SVG)</span>
            </div>
            <div class="image-upload-wrapper">
              <div v-if="logoPreview" class="image-preview">
                <img :src="logoPreview" alt="Logo Preview" />
                <button @click="removeLogo" class="btn-remove">Remove</button>
              </div>
              <input
                type="file"
                ref="logoInput"
                @change="handleLogoUpload"
                accept="image/png,image/jpeg,image/svg+xml"
                class="file-input"
              />
              <button @click="$refs.logoInput.click()" class="btn-secondary">
                Choose Logo
              </button>
            </div>
          </div>

          <!-- Favicon Upload -->
          <div class="setting-item">
            <div class="setting-header">
              <label>Website Favicon</label>
              <span class="setting-description">Upload your website favicon (PNG, ICO)</span>
            </div>
            <div class="image-upload-wrapper">
              <div v-if="faviconPreview" class="image-preview">
                <img :src="faviconPreview" alt="Favicon Preview" />
                <button @click="removeFavicon" class="btn-remove">Remove</button>
              </div>
              <input
                type="file"
                ref="faviconInput"
                @change="handleFaviconUpload"
                accept="image/png,image/x-icon"
                class="file-input"
              />
              <button @click="$refs.faviconInput.click()" class="btn-secondary">
                Choose Favicon
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
                placeholder="#008844"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings -->
      <div class="settings-group">
        <h2 class="group-title">⚡ System Settings</h2>
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
        <h2 class="group-title">✨ Features Settings</h2>
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
        <h2 class="group-title">📄 Footer Settings</h2>
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
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Bottom Save Button (Sticky) -->
    <div class="bottom-save-bar">
      <div class="bottom-save-content">
        <div class="bottom-save-info">
          <span class="changes-indicator" v-if="!isSaving">💾 Make changes above and click save</span>
          <span class="changes-indicator" v-else>⏳ Saving changes...</span>
        </div>
        <button @click="saveAllSettings" class="btn-primary btn-large" :disabled="isSaving">
          <svg v-if="!isSaving" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
          </svg>
          {{ isSaving ? 'Saving Changes...' : 'Save All Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

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

// Fetch all settings
const fetchSettings = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await axios.get('http://localhost:8000/api/settings', {
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
        logoPreview.value = `http://localhost:8000/storage/${settingsData.value.logo}`
      }
      if (settingsData.value.favicon) {
        faviconPreview.value = `http://localhost:8000/storage/${settingsData.value.favicon}`
      }
    }
  } catch (err) {
    console.error('Failed to fetch settings:', err)
    error.value = 'Failed to load settings. Please try again.'
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

// Format setting key to readable label
const formatLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
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
const removeLogo = () => {
  logoPreview.value = null
  logoFile.value = null
  settingsData.value.logo = null
}

// Remove favicon
const removeFavicon = () => {
  faviconPreview.value = null
  faviconFile.value = null
  settingsData.value.favicon = null
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

      await axios.post('http://localhost:8000/api/settings/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    // Upload favicon if changed
    if (faviconFile.value) {
      const formData = new FormData()
      formData.append('key', 'favicon')
      formData.append('image', faviconFile.value)

      await axios.post('http://localhost:8000/api/settings/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
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

    await axios.put('http://localhost:8000/api/settings/bulk', {
      settings: settingsToUpdate
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    successMessage.value = 'Settings saved successfully!'

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
    error.value = 'Failed to save settings. Please try again.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-page {
  padding: var(--spacing-6);
  padding-bottom: 100px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
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
  border-top-color: var(--color-primary);
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
}

.group-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
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
  border-color: var(--color-primary);
}

.color-input-wrapper {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
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
  background: var(--color-primary);
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(24px);
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
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
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
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background: white;
  border-top: 2px solid var(--color-border);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: var(--spacing-4) var(--spacing-6);
}

.bottom-save-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-save-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.changes-indicator {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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
}

.btn-large svg {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bottom-save-bar {
    left: 0;
  }

  .bottom-save-content {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .btn-large {
    width: 100%;
    justify-content: center;
  }
}
</style>
