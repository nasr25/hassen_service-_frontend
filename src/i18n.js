import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ar from './locales/ar.json'

// Arabic is the main language - default to Arabic
const savedLocale = localStorage.getItem('locale') || 'ar'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'ar', // Fallback to Arabic (main language)
  messages: {
    ar,  // Arabic as primary language
    en   // English as secondary
  },
  // Global properties
  globalInjection: true
})

export default i18n
