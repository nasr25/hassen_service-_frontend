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

[dir="rtl"] * {
  direction: rtl;
}

/* Override direction for specific elements that should remain LTR */
[dir="rtl"] code,
[dir="rtl"] .ltr-content {
  direction: ltr;
  text-align: left;
}

/* Form inputs */
[dir="rtl"] input,
[dir="rtl"] textarea,
[dir="rtl"] select {
  text-align: right;
  direction: rtl;
}

/* Tables */
[dir="rtl"] table {
  direction: rtl;
}

[dir="rtl"] th,
[dir="rtl"] td {
  text-align: right;
}

/* Modals and overlays */
[dir="rtl"] .modal-overlay,
[dir="rtl"] .modal-content {
  direction: rtl;
  text-align: right;
}

/* Buttons */
[dir="rtl"] .btn-back::before {
  content: "→ ";
}

[dir="rtl"] button,
[dir="rtl"] .btn {
  direction: rtl;
}

/* Flex containers - reverse direction */
[dir="rtl"] .actions,
[dir="rtl"] .request-actions,
[dir="rtl"] .modal-actions {
  flex-direction: row-reverse;
}

/* Grid layouts */
[dir="rtl"] .info-grid,
[dir="rtl"] .requests-grid,
[dir="rtl"] .assignments-grid {
  direction: rtl;
}

/* Badges and inline elements */
[dir="rtl"] .badge,
[dir="rtl"] .status-badge {
  direction: rtl;
}

/* Fix horizontal scrolling */
[dir="rtl"] .table-container {
  overflow-x: auto;
  direction: rtl;
}

/* Ensure page containers don't overflow */
[dir="rtl"] .page-container,
[dir="rtl"] .page-card {
  max-width: 100%;
  overflow-x: hidden;
}

[dir="rtl"] body,
[dir="rtl"] html {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Fix tabs */
[dir="rtl"] .tabs {
  flex-direction: row-reverse;
}

/* Fix navigation */
[dir="rtl"] .header {
  flex-direction: row-reverse;
}

/* Fix section headers */
[dir="rtl"] .section-header {
  flex-direction: row-reverse;
  text-align: right;
}

/* Fix stats and action grids */
[dir="rtl"] .stats-grid,
[dir="rtl"] .actions-grid {
  direction: rtl;
}

/* Fix welcome section */
[dir="rtl"] .welcome-section {
  flex-direction: row-reverse;
}

/* Fix filter bar */
[dir="rtl"] .filter-bar {
  flex-direction: row-reverse;
}

/* Fix timeline (keep LTR for timeline marker positioning) */
[dir="rtl"] .timeline {
  direction: ltr;
}

[dir="rtl"] .timeline-content {
  direction: rtl;
  text-align: right;
}

/* Fix member actions and item actions */
[dir="rtl"] .member-actions,
[dir="rtl"] .member-item {
  flex-direction: row-reverse;
}

/* Fix question cards and evaluation items */
[dir="rtl"] .question-card,
[dir="rtl"] .evaluation-item,
[dir="rtl"] .path-eval-item {
  direction: rtl;
}

/* Fix meta items */
[dir="rtl"] .meta-item,
[dir="rtl"] .request-meta {
  flex-direction: row-reverse;
}

/* Prevent text overflow in RTL */
[dir="rtl"] .truncate,
[dir="rtl"] .text-truncate {
  direction: rtl;
}

/* Fix responsive grids to not overflow */
[dir="rtl"] .requests-grid,
[dir="rtl"] .stats-grid,
[dir="rtl"] .actions-grid,
[dir="rtl"] .info-grid {
  width: 100%;
  max-width: 100%;
}

/* Fix dropdown and select menus */
[dir="rtl"] select {
  padding-right: 10px;
  padding-left: 30px;
  background-position: left 10px center;
}

/* Fix checkboxes and labels alignment */
[dir="rtl"] .form-group-inline,
[dir="rtl"] .checkbox-label {
  flex-direction: row-reverse;
}

/* Fix badges positioning */
[dir="rtl"] .badge {
  margin-right: 0;
  margin-left: 8px;
}

/* Fix request cards and stat cards */
[dir="rtl"] .stat-card,
[dir="rtl"] .action-card,
[dir="rtl"] .request-card {
  direction: rtl;
  text-align: right;
}

/* Fix icon alignment in cards */
[dir="rtl"] .stat-icon,
[dir="rtl"] .action-icon {
  margin-left: 0;
  margin-right: 0;
}

/* Fix assignments grid and cards */
[dir="rtl"] .assignment-card,
[dir="rtl"] .assignment-header {
  direction: rtl;
  text-align: right;
}

/* Fix paths and workflow cards */
[dir="rtl"] .path-option,
[dir="rtl"] .path-header,
[dir="rtl"] .path-steps {
  direction: rtl;
  text-align: right;
}

/* Fix evaluation forms */
[dir="rtl"] .evaluation-form,
[dir="rtl"] .evaluation-question,
[dir="rtl"] .answer-section {
  direction: rtl;
  text-align: right;
}

/* Fix toggle buttons */
[dir="rtl"] .toggle-buttons,
[dir="rtl"] .rating-scale {
  flex-direction: row-reverse;
}

/* Mobile responsive fixes for RTL */
@media (max-width: 768px) {
  [dir="rtl"] .page-card {
    padding: 20px;
  }

  [dir="rtl"] .modal-content {
    padding: 20px;
  }

  [dir="rtl"] .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  [dir="rtl"] .stats-grid,
  [dir="rtl"] .actions-grid,
  [dir="rtl"] .requests-grid {
    grid-template-columns: 1fr;
  }
}

/* Fix timeline for RTL */
[dir="rtl"] .timeline::before {
  right: 20px;
  left: auto;
}

[dir="rtl"] .timeline-item {
  padding-right: 60px;
  padding-left: 0;
}

[dir="rtl"] .timeline-marker {
  right: 0;
  left: auto;
}

/* Fix attachments list */
[dir="rtl"] .attachment-item {
  flex-direction: row-reverse;
}

/* Fix dept badges */
[dir="rtl"] .dept-badges {
  flex-direction: row-reverse;
}

/* Fix user role cards */
[dir="rtl"] .user-role-card,
[dir="rtl"] .user-role-header,
[dir="rtl"] .user-role-body {
  direction: rtl;
  text-align: right;
}

/* Fix permission items */
[dir="rtl"] .permission-item,
[dir="rtl"] .permission-list {
  direction: rtl;
  text-align: right;
}
</style>
