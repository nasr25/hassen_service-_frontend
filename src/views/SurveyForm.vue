<template>
  <AppLayout>
    <div class="survey-form-page">
      <!-- Back button -->
      <button
        @click="router.push('/surveys')"
        class="btn-back"
      >
        ← {{ $t('survey.backToSurveys') }}
      </button>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <!-- Already submitted -->
      <div
        v-else-if="hasResponded"
        class="submitted-state"
      >
        <div class="submitted-icon">✅</div>
        <h2>{{ $t('survey.alreadySubmitted') }}</h2>
        <p>{{ $t('survey.surveySubmitted') }}</p>
        <button
          @click="router.push('/surveys')"
          class="btn-primary"
        >
          {{ $t('survey.backToSurveys') }}
        </button>
      </div>

      <!-- Survey Form -->
      <div
        v-else-if="survey"
        class="survey-container"
      >
        <div class="survey-header">
          <h1>{{ isArabic ? survey.title_ar : survey.title }}</h1>
          <p
            v-if="survey.description || survey.description_ar"
            class="survey-desc"
          >{{ isArabic ? (survey.description_ar || survey.description) : (survey.description || survey.description_ar) }}</p>
        </div>

        <form @submit.prevent="submitSurvey">
          <div
            v-for="(question, qIndex) in survey.questions"
            :key="question.id"
            class="question-card"
          >
            <div class="question-header">
              <span class="question-number">{{ qIndex + 1 }}</span>
              <div class="question-text">
                <h3>{{ isArabic ? question.question_text_ar : question.question_text }}</h3>
                <span
                  v-if="question.is_required"
                  class="required-badge"
                >{{ $t('survey.required') }}</span>
                <span
                  v-else
                  class="optional-badge"
                >{{ $t('survey.optional') }}</span>
              </div>
            </div>

            <!-- Multiple Choice -->
            <div
              v-if="question.question_type === 'multiple_choice'"
              class="choice-options"
            >
              <button
                v-for="option in question.options"
                :key="option.id"
                type="button"
                :class="['choice-btn', { selected: answers[question.id]?.option_id === option.id }]"
                @click="selectOption(question.id, option.id)"
              >
                {{ isArabic ? option.option_text_ar : option.option_text }}
              </button>
            </div>

            <!-- Satisfaction Rating -->
            <div
              v-else-if="question.question_type === 'satisfaction'"
              class="satisfaction-scale"
            >
              <button
                v-for="option in question.options"
                :key="option.id"
                type="button"
                :class="['satisfaction-btn', `satisfaction-${option.option_value}`, { selected: answers[question.id]?.option_id === option.id }]"
                @click="selectOption(question.id, option.id)"
              >
                <span class="satisfaction-value">{{ option.option_value }}</span>
                <span class="satisfaction-label">{{ isArabic ? option.option_text_ar : option.option_text }}</span>
              </button>
            </div>

            <!-- Text Area -->
            <div
              v-else-if="question.question_type === 'text'"
              class="text-input"
            >
              <textarea
                v-model="answers[question.id].text_answer"
                rows="4"
                :placeholder="$t('survey.textPlaceholder')"
                class="text-area"
              ></textarea>
            </div>
          </div>

          <!-- Validation Error -->
          <div
            v-if="validationError"
            class="validation-error"
          >
            {{ validationError }}
          </div>

          <!-- Submit Button -->
          <div class="submit-section">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-submit"
            >
              {{ isSubmitting ? $t('survey.submitting') : $t('survey.submitSurvey') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";
import { useAlert } from "../composables/useAlert";
import AppLayout from "../components/AppLayout.vue";
import { httpRequest } from "../services/api";
import axios from "axios";
import { API_URL } from "../config/api";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t, locale } = useI18n();
const { showSuccess, showError } = useAlert();

const survey = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const hasResponded = ref(false);
const validationError = ref(null);
const answers = reactive({});

const isArabic = computed(() => locale.value === "ar");

const requestId = route.query.request_id || null;

onMounted(async () => {
  try {
    const url = requestId
      ? `/surveys/${route.params.id}?request_id=${requestId}`
      : `/surveys/${route.params.id}`;
    const res = await httpRequest(url);
    survey.value = res.data.survey;
    hasResponded.value = res.data.has_responded;

    // Initialize answers structure
    if (survey.value && !hasResponded.value) {
      survey.value.questions.forEach((q) => {
        answers[q.id] = {
          question_id: q.id,
          option_id: null,
          text_answer: "",
        };
      });
    }
  } catch (err) {
    showError(err.response?.data?.message || "Failed to load survey");
    router.push("/surveys");
  } finally {
    isLoading.value = false;
  }
});

const selectOption = (questionId, optionId) => {
  answers[questionId].option_id = optionId;
  validationError.value = null;
};

const submitSurvey = async () => {
  validationError.value = null;

  // Validate required questions
  for (const question of survey.value.questions) {
    if (!question.is_required) continue;
    const answer = answers[question.id];
    if (question.question_type === "text" && !answer.text_answer?.trim()) {
      validationError.value = t("survey.allRequiredMessage");
      return;
    }
    if (["multiple_choice", "satisfaction"].includes(question.question_type) && !answer.option_id) {
      validationError.value = t("survey.allRequiredMessage");
      return;
    }
  }

  try {
    isSubmitting.value = true;
    const answersArray = Object.values(answers).map((a) => ({
      question_id: a.question_id,
      option_id: a.option_id,
      text_answer: a.text_answer || null,
    }));

    const submitData = { answers: answersArray };
    if (requestId) {
      submitData.request_id = parseInt(requestId);
    }

    await axios.post(
      `${API_URL}/surveys/${route.params.id}/submit`,
      submitData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    showSuccess(t("messages.success.surveySubmitted"));
    hasResponded.value = true;
  } catch (err) {
    showError(err.response?.data?.message || "Failed to submit survey");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.survey-form-page {
  max-width: 800px;
  margin: 0 auto;
}

.btn-back {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) 0;
  margin-bottom: var(--spacing-4);
  transition: color var(--transition-fast);
}

.btn-back:hover {
  color: #02735e;
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

.submitted-state {
  text-align: center;
  padding: var(--spacing-16);
}

.submitted-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-4);
}

.submitted-state h2 {
  margin: 0 0 var(--spacing-2);
  color: var(--color-text-primary);
}

.submitted-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

.survey-container {
  background: rgba(var(--v-theme-dark_white), 1);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.survey-header {
  padding: var(--spacing-8);
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
}

.survey-header h1 {
  margin: 0 0 var(--spacing-2);
  font-size: var(--font-size-2xl);
}

.survey-desc {
  margin: 0;
  opacity: 0.9;
  font-size: var(--font-size-sm);
}

.question-card {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.question-card:last-of-type {
  border-bottom: none;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.question-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.question-text {
  flex: 1;
}

.question-text h3 {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.required-badge {
  font-size: var(--font-size-xs);
  color: #ef4444;
  font-weight: var(--font-weight-medium);
}

.optional-badge {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Multiple Choice */
.choice-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.choice-btn {
  padding: var(--spacing-3) var(--spacing-5);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.choice-btn:hover {
  border-color: #02735e;
  background: rgba(2, 115, 94, 0.05);
}

.choice-btn.selected {
  border-color: #02735e;
  background: #02735e;
  color: white;
}

/* Satisfaction Scale */
.satisfaction-scale {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.satisfaction-btn {
  flex: 1;
  min-width: 100px;
  padding: var(--spacing-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.satisfaction-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.satisfaction-value {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-1);
}

.satisfaction-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Satisfaction colors */
.satisfaction-1 { border-color: #fecaca; }
.satisfaction-1:hover, .satisfaction-1.selected { background: #fef2f2; border-color: #ef4444; }
.satisfaction-1.selected .satisfaction-value { color: #ef4444; }

.satisfaction-2 { border-color: #fed7aa; }
.satisfaction-2:hover, .satisfaction-2.selected { background: #fff7ed; border-color: #f97316; }
.satisfaction-2.selected .satisfaction-value { color: #f97316; }

.satisfaction-3 { border-color: #fef08a; }
.satisfaction-3:hover, .satisfaction-3.selected { background: #fefce8; border-color: #eab308; }
.satisfaction-3.selected .satisfaction-value { color: #eab308; }

.satisfaction-4 { border-color: #bbf7d0; }
.satisfaction-4:hover, .satisfaction-4.selected { background: #f0fdf4; border-color: #22c55e; }
.satisfaction-4.selected .satisfaction-value { color: #22c55e; }

.satisfaction-5 { border-color: #86efac; }
.satisfaction-5:hover, .satisfaction-5.selected { background: #ecfdf5; border-color: #16a34a; }
.satisfaction-5.selected .satisfaction-value { color: #16a34a; }

/* Text Area */
.text-area {
  width: 100%;
  padding: var(--spacing-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.text-area:focus {
  outline: none;
  border-color: #02735e;
}

/* Validation */
.validation-error {
  margin: var(--spacing-4) var(--spacing-6);
  padding: var(--spacing-3) var(--spacing-4);
  background: #fef2f2;
  color: #ef4444;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  border: 1px solid #fecaca;
}

/* Submit */
.submit-section {
  padding: var(--spacing-6);
  display: flex;
  justify-content: center;
}

.btn-submit {
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border: none;
  padding: var(--spacing-4) var(--spacing-10);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border: none;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .satisfaction-scale {
    flex-direction: column;
  }

  .satisfaction-btn {
    min-width: unset;
  }

  .choice-options {
    flex-direction: column;
  }

  .choice-btn {
    text-align: center;
  }
}
</style>
