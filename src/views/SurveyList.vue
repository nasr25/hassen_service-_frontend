<template>
  <AppLayout>
    <div class="survey-list-page">
      <div class="page-header">
        <div>
          <h1>{{ $t('survey.myResponses') }}</h1>
          <p class="page-subtitle">{{ $t('survey.myResponsesSubtitle') }}</p>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <div
        v-else-if="allResponses.length === 0"
        class="empty-state"
      >
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <h3>{{ $t('survey.noResponses') }}</h3>
        <p>{{ $t('survey.noResponsesDescription') }}</p>
      </div>

      <template v-else>
        <!-- Cards Grid -->
        <div class="responses-grid">
          <div
            v-for="response in paginatedResponses"
            :key="response.id"
            class="response-card"
          >
            <div class="response-card-body">
              <h3 class="survey-title">
                {{ isArabic ? (response.survey?.title_ar || response.survey?.title) : (response.survey?.title || response.survey?.title_ar) }}
              </h3>

              <p
                v-if="response.survey?.description || response.survey?.description_ar"
                class="survey-description"
              >
                {{ isArabic ? (response.survey?.description_ar || response.survey?.description) : (response.survey?.description || response.survey?.description_ar) }}
              </p>

              <div class="response-meta">
                <span class="meta-item idea-badge" v-if="response.request">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                  </svg>
                  {{ $t('survey.linkedIdea') }}: #{{ response.request.id }} - {{ response.request.title }}
                </span>
                <span class="meta-item general-badge" v-else>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                  </svg>
                  {{ $t('survey.generalSurvey') }}
                </span>
              </div>

              <div class="response-footer-meta">
                <span class="meta-item">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                  {{ $t('survey.submittedOn') }} {{ formatDate(response.submitted_at) }}
                </span>
                <span class="meta-item">
                  {{ $t('survey.questionsAnswered', { count: response.answers?.length || 0 }) }}
                </span>
              </div>
            </div>

            <div class="response-card-footer">
              <button
                class="btn-toggle-answers"
                @click="toggleAnswers(response.id)"
              >
                {{ expandedResponses.has(response.id) ? $t('survey.hideAnswers') : $t('survey.viewAnswers') }}
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  :class="{ 'chevron-rotated': expandedResponses.has(response.id) }"
                  class="chevron-icon"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <div
              v-if="expandedResponses.has(response.id)"
              class="answers-section"
            >
              <div
                v-for="(answer, index) in response.answers"
                :key="answer.id"
                class="answer-item"
              >
                <div class="answer-question">
                  <span class="question-number">{{ index + 1 }}.</span>
                  {{ isArabic ? (answer.question?.question_text_ar || answer.question?.question_text) : (answer.question?.question_text || answer.question?.question_text_ar) }}
                </div>
                <div class="answer-value">
                  <span class="answer-label">{{ $t('survey.yourAnswer') }}:</span>
                  <span v-if="answer.selected_option">
                    {{ isArabic ? (answer.selected_option.option_text_ar || answer.selected_option.option_text) : (answer.selected_option.option_text || answer.selected_option.option_text_ar) }}
                  </span>
                  <span v-else-if="answer.text_answer">{{ answer.text_answer }}</span>
                  <span v-else class="no-answer">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="pagination"
        >
          <div class="pagination-info-left">
            {{ $t('ideasBank.showing') }}
            <strong>{{ ((currentPage - 1) * perPage) + 1 }}</strong>
            {{ $t('common.to') }}
            <strong>{{ Math.min(currentPage * perPage, allResponses.length) }}</strong>
            {{ $t('common.of') }}
            <strong>{{ allResponses.length }}</strong>
            {{ $t('ideasBank.results') }}
          </div>
          <div
            class="pagination-controls"
            v-if="locale === 'en'"
          >
            <button
              class="btn-pagination"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              {{ $t('common.previous') }}
            </button>
            <span class="pagination-pages">
              {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
            </span>
            <button
              class="btn-pagination"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              {{ $t('common.next') }}
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div
            class="pagination-controls"
            v-else
          >
            <button
              class="btn-pagination"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              {{ $t('common.next') }}
            </button>
            <span class="pagination-pages">
              {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
            </span>
            <button
              class="btn-pagination"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              {{ $t('common.previous') }}
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AppLayout from "../components/AppLayout.vue";
import { httpRequest } from "../services/api";

const { t, locale } = useI18n();

const allResponses = ref([]);
const isLoading = ref(true);
const expandedResponses = ref(new Set());
const currentPage = ref(1);
const perPage = 6;

const isArabic = computed(() => locale.value === "ar");

const totalPages = computed(() =>
  Math.ceil(allResponses.value.length / perPage)
);

const paginatedResponses = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return allResponses.value.slice(start, start + perPage);
});

onMounted(async () => {
  try {
    const res = await httpRequest("/surveys/my-responses");
    allResponses.value = res.data.responses;
  } catch (err) {
    console.error("Failed to load survey responses:", err);
  } finally {
    isLoading.value = false;
  }
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const toggleAnswers = (responseId) => {
  const newSet = new Set(expandedResponses.value);
  if (newSet.has(responseId)) {
    newSet.delete(responseId);
  } else {
    newSet.add(responseId);
  }
  expandedResponses.value = newSet;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(isArabic.value ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped>
.survey-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-8);
}

.page-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  color: var(--color-text-secondary);
  margin: var(--spacing-2) 0 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  gap: var(--spacing-4);
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: #02735e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-16);
  color: var(--color-text-secondary);
}

.empty-state svg {
  opacity: 0.3;
  margin-bottom: var(--spacing-4);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-2);
  color: var(--color-text-primary);
}

/* Cards Grid */
.responses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--spacing-6);
}

.response-card {
  background: rgba(var(--v-theme-dark_white), 1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow var(--transition-fast);
}

.response-card:hover {
  box-shadow: var(--shadow-lg);
}

.response-card-body {
  padding: var(--spacing-6);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.survey-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-3);
}

.survey-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--spacing-4);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.response-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.response-footer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  margin-top: auto;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.idea-badge {
  color: #02735e;
  font-weight: var(--font-weight-medium);
}

.general-badge {
  color: #6b7280;
}

.response-card-footer {
  padding: var(--spacing-3) var(--spacing-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-start;
}

.btn-toggle-answers {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: none;
  border: none;
  color: #02735e;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--spacing-2) 0;
  transition: color var(--transition-fast);
}

.btn-toggle-answers:hover {
  color: #015a4a;
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.chevron-rotated {
  transform: rotate(180deg);
}

.answers-section {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-5) var(--spacing-6);
  background: rgba(0, 0, 0, 0.02);
}

.answer-item {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  background: rgba(var(--v-theme-dark_white), 1);
  border: 1px solid var(--color-border);
}

.answer-item + .answer-item {
  margin-top: var(--spacing-3);
}

.answer-question {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.question-number {
  color: #02735e;
  font-weight: var(--font-weight-bold);
  margin-inline-end: var(--spacing-1);
}

.answer-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.answer-label {
  font-weight: var(--font-weight-medium);
  margin-inline-end: var(--spacing-1);
}

.no-answer {
  opacity: 0.5;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(var(--v-theme-dark_white), 1);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
  flex-direction: row-reverse;
}

.pagination-info-left {
  font-size: 14px;
  color: #6b7280;
}

.pagination-info-left strong {
  color: #1f2937;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #02735e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-pagination:hover:not(:disabled) {
  background: #015a4a;
}

.btn-pagination:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-pages {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .responses-grid {
    grid-template-columns: 1fr;
  }

  .response-meta {
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-info-left {
    text-align: center;
  }
}

[dir="rtl"] .pagination {
  flex-direction: row-reverse;
}

[dir="rtl"] .pagination-controls {
  flex-direction: row-reverse;
}
</style>
