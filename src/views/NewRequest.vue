<template>
  <AppLayout>
    <div class="new-request">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <BaseButton variant="ghost" size="sm" @click="goBack" class="back-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            </svg>
            {{ $t('common.back') }}
          </BaseButton>
          <div>
            <h1>{{ isEditMode ? $t('request.editRequest') : 'Submit New Idea' }}</h1>
            <p class="subtitle">{{ isEditMode ? 'Update your idea details and resubmit' : 'Share your innovative idea with us' }}</p>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="error" class="alert alert-error">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        {{ error }}
      </div>

      <div v-if="success" class="alert alert-success">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        {{ success }}
      </div>

      <!-- Form Card -->
      <BaseCard class="form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Idea Title -->
          <BaseInput
            v-model="form.title"
            type="text"
            label="Idea Title"
            placeholder="Enter a clear and concise title for your idea"
            required
            :error="validationErrors.title"
            :help="!validationErrors.title ? `${form.title.length}/200 characters` : ''"
          />

          <!-- Idea Description -->
          <BaseInput
            v-model="form.description"
            type="textarea"
            label="Idea Description"
            placeholder="Describe your idea in detail (minimum 25 characters)"
            :rows="6"
            required
            :error="validationErrors.description"
            :help="!validationErrors.description ? `${form.description.length} characters (minimum 25 required)` : ''"
          />

          <!-- Idea Type -->
          <BaseSelect
            v-model="form.idea_type"
            label="Idea Type"
            placeholder="Select an idea type"
            required
            :options="ideaTypeOptions"
            :error="validationErrors.idea_type"
            help="Choose the category that best fits your idea"
          />

          <!-- Department -->
          <BaseSelect
            v-model="form.department"
            label="Department"
            placeholder="Select a department"
            required
            :options="departmentOptions"
            :error="validationErrors.department"
            help="Select the department related to your idea, or choose 'Unknown' if unsure"
          />

          <!-- Benefits -->
          <BaseInput
            v-model="form.benefits"
            type="textarea"
            label="Benefits"
            placeholder="Describe the potential benefits of implementing this idea (optional)"
            :rows="4"
            :help="'Optional: Explain how this idea will benefit the organization'"
          />

          <!-- Additional Details (Edit Mode Only) -->
          <BaseInput
            v-if="isEditMode"
            v-model="form.additional_details"
            type="textarea"
            label="Additional Details"
            placeholder="Add any additional information requested by the reviewer"
            :rows="4"
            help="Provide any clarifications or additional information requested"
          />

          <!-- File Upload Section -->
          <div class="form-group">
            <label class="form-label">
              Attachments
              <span class="optional-text">(Optional - Max 4 files)</span>
            </label>
            <div class="file-upload-container">
              <input
                type="file"
                id="file"
                ref="fileInput"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                class="file-input"
              />
              <label for="file" class="file-upload-label">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span>Choose files or drag and drop</span>
                <span class="file-types">PDF, JPG, JPEG, PNG (Max 4 files)</span>
              </label>
            </div>
            <span v-if="validationErrors.attachments" class="form-error">{{ validationErrors.attachments }}</span>
          </div>

          <!-- Uploaded Files List -->
          <div v-if="uploadedFiles.length > 0" class="uploaded-files-section">
            <div class="files-header">
              <h3>Uploaded Files ({{ uploadedFiles.length }}/4)</h3>
            </div>
            <div class="files-list">
              <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                <div class="file-info">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                  </svg>
                  <div class="file-details">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  @click="removeFile(index)"
                  type="button"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <BaseButton
              type="button"
              variant="outline"
              size="lg"
              @click="saveDraft"
              :disabled="isLoading || isDraftSave"
              :loading="isDraftSave"
            >
              Save as Draft
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :disabled="isLoading || isDraftSave || !isFormValid"
              :loading="isLoading && !isDraftSave"
            >
              {{ isEditMode ? 'Update & Resubmit' : 'Submit Idea' }}
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppLayout from '../components/AppLayout.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const API_URL = 'http://localhost:8000/api'

const form = ref({
  title: '',
  description: '',
  idea_type: '',
  department: '',
  benefits: '',
  additional_details: ''
})

const uploadedFiles = ref([])
const fileInput = ref(null)
const error = ref(null)
const success = ref(null)
const isLoading = ref(false)
const isDraftSave = ref(false)
const validationErrors = ref({})
const isEditMode = ref(false)
const departments = ref([])

// Idea Type Options
const ideaTypeOptions = [
  { value: 'x', label: 'Process Improvement' },
  { value: 'y', label: 'Cost Reduction' },
  { value: 'z', label: 'Innovation' }
]

// Department Options (will be loaded from API + Unknown)
const departmentOptions = computed(() => {
  const deptList = departments.value.map(dept => ({
    value: dept.id.toString(),
    label: dept.name
  }))

  return [
    ...deptList,
    { value: 'unknown', label: 'Unknown' }
  ]
})

// Form validation
const isFormValid = computed(() => {
  return (
    form.value.title.length > 0 &&
    form.value.title.length <= 200 &&
    form.value.description.length >= 25 &&
    form.value.idea_type !== '' &&
    form.value.department !== '' &&
    uploadedFiles.value.length <= 4
  )
})

onMounted(async () => {
  await loadDepartments()

  // Check if editing existing request
  if (route.params.id) {
    isEditMode.value = true
    await loadRequest(route.params.id)
  }
})

const loadDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/departments`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    departments.value = response.data.departments || []
  } catch (err) {
    console.error('Failed to load departments:', err)
    // Set default departments if API fails
    departments.value = [
      { id: 1, name: 'Department A' },
      { id: 2, name: 'Technical' },
      { id: 3, name: 'Finance' },
      { id: 4, name: 'Legal' },
      { id: 5, name: 'Strategy' },
      { id: 6, name: 'HR' }
    ]
  }
}

const loadRequest = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/requests/${id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    const request = response.data.request
    form.value = {
      title: request.title || '',
      description: request.description || '',
      idea_type: request.idea_type || '',
      department: request.department_id?.toString() || '',
      benefits: request.benefits || '',
      additional_details: request.additional_details || ''
    }
  } catch (err) {
    error.value = 'Failed to load request details'
  }
}

const validateForm = () => {
  const errors = {}

  // Title validation
  if (!form.value.title) {
    errors.title = 'Idea title is required'
  } else if (form.value.title.length > 200) {
    errors.title = 'Title must not exceed 200 characters'
  }

  // Description validation
  if (!form.value.description) {
    errors.description = 'Idea description is required'
  } else if (form.value.description.length < 25) {
    errors.description = 'Description must be at least 25 characters'
  }

  // Idea Type validation
  if (!form.value.idea_type) {
    errors.idea_type = 'Please select an idea type'
  }

  // Department validation
  if (!form.value.department) {
    errors.department = 'Please select a department'
  }

  // File validation
  if (uploadedFiles.value.length > 4) {
    errors.attachments = 'Maximum 4 files allowed'
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)

  // Check total file count
  if (uploadedFiles.value.length + files.length > 4) {
    validationErrors.value.attachments = 'Maximum 4 files allowed'
    return
  }

  // Validate file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))

  if (invalidFiles.length > 0) {
    validationErrors.value.attachments = 'Only PDF, JPG, JPEG, and PNG files are allowed'
    return
  }

  // Add valid files
  uploadedFiles.value.push(...files)
  validationErrors.value.attachments = ''

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
  validationErrors.value.attachments = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!validateForm()) {
    error.value = 'Please fix the validation errors'
    return
  }

  try {
    isLoading.value = true
    error.value = null
    success.value = null

    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)
    formData.append('idea_type', form.value.idea_type)
    formData.append('department', form.value.department)
    formData.append('benefits', form.value.benefits || '')
    formData.append('status', 'pending')

    if (isEditMode.value && form.value.additional_details) {
      formData.append('additional_details', form.value.additional_details)
    }

    // Append files
    uploadedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })

    let response
    if (isEditMode.value) {
      response = await axios.post(`${API_URL}/requests/${route.params.id}`, formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
    } else {
      response = await axios.post(`${API_URL}/requests`, formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    success.value = isEditMode.value ? 'Idea updated successfully!' : 'Idea submitted successfully!'

    setTimeout(() => {
      router.push('/requests')
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit idea. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const saveDraft = async () => {
  if (!form.value.title || !form.value.description) {
    error.value = 'Title and description are required to save as draft'
    return
  }

  try {
    isDraftSave.value = true
    error.value = null
    success.value = null

    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)
    formData.append('idea_type', form.value.idea_type || '')
    formData.append('department', form.value.department || '')
    formData.append('benefits', form.value.benefits || '')
    formData.append('status', 'draft')

    // Append files
    uploadedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })

    await axios.post(`${API_URL}/requests`, formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'multipart/form-data'
      }
    })

    success.value = 'Draft saved successfully!'

    setTimeout(() => {
      router.push('/requests')
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save draft'
  } finally {
    isDraftSave.value = false
  }
}

const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.new-request {
  max-width: 900px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: var(--spacing-8);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.back-button {
  align-self: flex-start;
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Form Card */
.form-card {
  padding: var(--spacing-8);
}

.form-group {
  margin-bottom: var(--spacing-6);
}

.optional-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
  margin-left: var(--spacing-2);
}

/* File Upload */
.file-upload-container {
  margin-top: var(--spacing-2);
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-10);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.file-upload-label:hover {
  border-color: var(--color-primary-400);
  background: var(--color-primary-50);
}

.file-upload-label svg {
  color: var(--color-primary-600);
}

.file-upload-label span {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.file-types {
  font-size: var(--font-size-xs);
  color: var(--color-text-disabled);
  font-weight: var(--font-weight-normal);
}

/* Uploaded Files */
.uploaded-files-section {
  margin-top: var(--spacing-6);
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

.files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.files-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.file-item:hover {
  border-color: var(--color-primary-300);
  background: var(--color-primary-50);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.file-info svg {
  color: var(--color-primary-600);
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border);
}

.form-actions button {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: var(--spacing-6);
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: var(--font-size-2xl);
  }

  .file-upload-label {
    padding: var(--spacing-6);
  }
}
</style>
