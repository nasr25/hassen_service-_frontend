import { ref, computed } from 'vue'
import axios from 'axios'
import { API_URL, BASE_URL } from '../config/api'

const settings = ref({
  site_name: 'Workflow Management System',
  site_name_ar: 'نظام إدارة سير العمل',
  site_description: 'Workflow Management System',
  site_description_ar: 'نظام إدارة سير العمل',
  logo: null,
  favicon: null,
  primary_color: '#005028',
  secondary_color: '#0066cc'
})

const isLoaded = ref(false)
const isLoading = ref(false)

export function useSettings() {
  const fetchPublicSettings = async () => {
    if (isLoaded.value || isLoading.value) {
      return settings.value
    }

    try {
      isLoading.value = true
      const response = await axios.get(`${API_URL}/settings/public`)

      if (response.data.settings) {
        settings.value = {
          ...settings.value,
          ...response.data.settings
        }
        isLoaded.value = true
      }
    } catch (error) {
      console.error('Failed to fetch public settings:', error)
    } finally {
      isLoading.value = false
    }

    return settings.value
  }

  const getSetting = (key, defaultValue = null) => {
    return settings.value[key] ?? defaultValue
  }

  const getImageUrl = (path) => {
    if (!path) return null
    return `${BASE_URL}/storage/${path}`
  }

  // Computed properties for commonly used settings
  const siteName = computed(() => settings.value.site_name || 'Workflow Management System')
  const siteNameAr = computed(() => settings.value.site_name_ar || 'نظام إدارة سير العمل')
  const siteDescription = computed(() => settings.value.site_description || 'Workflow Management System')
  const siteDescriptionAr = computed(() => settings.value.site_description_ar || 'نظام إدارة سير العمل')
  const logo = computed(() => settings.value.logo ? getImageUrl(settings.value.logo) : null)
  const favicon = computed(() => settings.value.favicon ? getImageUrl(settings.value.favicon) : null)
  const primaryColor = computed(() => settings.value.primary_color || '#005028')
  const secondaryColor = computed(() => settings.value.secondary_color || '#0066cc')

  return {
    settings,
    isLoaded,
    isLoading,
    fetchPublicSettings,
    getSetting,
    getImageUrl,
    siteName,
    siteNameAr,
    siteDescription,
    siteDescriptionAr,
    logo,
    favicon,
    primaryColor,
    secondaryColor
  }
}
