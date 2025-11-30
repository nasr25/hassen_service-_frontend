<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const { locale } = useI18n()

onMounted(() => {
  authStore.initializeAuth()
  updateDirection(locale.value)
})

// Watch for locale changes and update document direction
watch(locale, (newLocale) => {
  updateDirection(newLocale)
  localStorage.setItem('locale', newLocale)
})

const updateDirection = (lang) => {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lang)

  // Update body font for Arabic
  if (lang === 'ar') {
    document.body.style.fontFamily = "'Cairo', 'Tajawal', 'Arial', sans-serif"
  } else {
    document.body.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  transition: font-family 0.3s ease;
}

/* Arabic font import */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap');

#app {
  width: 100%;
  min-height: 100vh;
}

/* RTL-specific fixes */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .modal-overlay {
  direction: rtl;
}

[dir="rtl"] input,
[dir="rtl"] textarea,
[dir="rtl"] select {
  text-align: right;
}

[dir="rtl"] .btn-back::before {
  content: "→ ";
}

[dir="rtl"] .btn-back {
  content: "";
}
</style>
