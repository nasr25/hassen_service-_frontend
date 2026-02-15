<template>
  <AppLayout>
    <div class="new-request">
      <!-- Header -->
      <div class="page-header">
        <TableHeader
          :title="isEditMode ? $t('request.editRequest') : $t('request.submitNewIdea') "
          :breadcrumbs="pageBreadcrumbs"
        />

      </div>

      <!-- Alerts -->
      <div
        v-if="error"
        class="alert alert-error"
      >
        <svg
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        {{ error }}
      </div>

      <div
        v-if="success"
        class="alert alert-success"
      >
        <svg
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        {{ success }}
      </div>

      <!-- Form Card -->
      <BaseCard class="form-card">
        <form
          @submit.prevent="handleSubmit"
          novalidate
        >
          <!-- Idea Title -->
          <BaseInput
            v-model="form.title"
            type="text"
            :label="$t('request.ideaTitle')"
            :placeholder="$t('request.ideaTitlePlaceholder')"
            required
            :error="touched.title ? validationErrors.title : ''"
            :help="!validationErrors.title ? $t('request.ideaTitleCharCount', { count: form.title.length }) : ''"
            @blur="handleBlur('title')"
          />

          <!-- Idea Description -->
          <BaseInput
            v-model="form.description"
            type="textarea"
            :label="$t('request.ideaDescription')"
            :placeholder="$t('request.ideaDescriptionPlaceholder')"
            :rows="6"
            required
            :error="touched.description ? validationErrors.description : ''"
            @blur="handleBlur('description')"
          />

          <!-- Department / Innovative Path -->
          <div class="form-group">
            <label class="form-label">
              {{ $t('request.innovativePath') }}
              <span class="required-star">*</span>
            </label>
            <div class="radio-group idea-type-checkbox-group">
              <label
                v-for="dept in departmentOptions"
                :key="dept.value"
                class="radio-label idea-type-option"
                :class="{ 'active': form.department === dept.value }"
              >
                <input
                  type="radio"
                  v-model="form.department"
                  :value="dept.value"
                  name="department"
                  class="radio-input"
                  @blur="handleBlur('department')"
                />
                <span class="checkbox-text">{{ dept.label }}</span>
              </label>
            </div>
            <span
              v-if="touched.department && validationErrors.department"
              class="form-error"
            >{{ validationErrors.department }}</span>
            <span
              v-else
              class="form-help"
            >{{ $t('request.departmentHelp') }}</span>
          </div>

          <!-- Idea Ownership Type -->
          <div class="form-group">
            <label class="form-label">{{ $t('request.ideaOwnership') }}</label>
            <div
              class="radio-group"
              :key="'ownership-' + formKey"
            >
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="form.idea_ownership_type"
                  value="individual"
                  name="idea_ownership"
                  class="radio-input"
                />
                <span>{{ $t('request.individualIdea') }}</span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="form.idea_ownership_type"
                  value="shared"
                  name="idea_ownership"
                  class="radio-input"
                />
                <span>{{ $t('request.sharedIdea') }}</span>
              </label>
            </div>
            <span class="form-help">{{ $t('request.ideaOwnershipHelp') }}</span>
          </div>

          <!-- Employee Search (Shared Ideas Only) -->
          <div
            v-if="form.idea_ownership_type === 'shared'"
            class="form-group"
          >
            <label class="form-label">
              <span class="optional-text">{{ $t('request.searchEmployeesAD') }}</span>
            </label>
            <div class="employee-search-container">
              <input
                type="text"
                v-model="employeeSearchQuery"
                @input="searchEmployees"
                :placeholder="$t('request.searchEmployeesPlaceholder')"
                class="employee-search-input"
              />

              <!-- Search Results -->
              <div
                v-if="employeeSearchResults.length > 0 && employeeSearchQuery.length > 1"
                class="search-results"
              >
                <div
                  v-for="employee in employeeSearchResults"
                  :key="employee.id"
                  @click="addEmployee(employee)"
                  class="search-result-item"
                >
                  <div class="employee-info">
                    <strong>{{ employee.name }}</strong>
                    <span class="employee-meta">{{ employee.email }}</span>
                    <span>{{ employee.title }}</span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  v-if="employeeSearchQuery.length > 1 && employeeSearchResults.length === 0 && !isSearching"
                  class="no-results"
                >
                  {{ $t('request.noEmployeesFound') }}
                </div>
              </div>
              <div
                v-if="isSearching"
                class="searching-indicator"
              >
                {{ $t('request.searching') }}
              </div>
            </div>

            <!-- Selected Employees -->
            <div
              v-if="form.employees.length > 0"
              class="selected-employees"
            >
              <div class="employees-header">
                <h4>{{ $t('request.selectedEmployees', { count: form.employees.length }) }}</h4>
              </div>
              <div class="employees-list">
                <div
                  v-for="(employee, index) in form.employees"
                  :key="index"
                  class="employee-item"
                >
                  <div class="employee-details">
                    <strong>{{ employee.employee_name }}</strong>
                    <div class="employee-meta-info">
                      <span v-if="employee.employee_email">{{ employee.employee_email }}</span>
                      <span v-if="employee.employee_department">{{ employee.employee_department }}</span>
                      <span v-if="employee.employee_title">{{ employee.employee_title }}</span>
                    </div>
                  </div>
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    @click="removeEmployee(index)"
                    type="button"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Benefits -->
          <BaseInput
            v-model="form.benefits"
            type="textarea"
            :label="$t('request.expectedImpact')"
            :placeholder="$t('request.benefitsPlaceholder')"
            :rows="4"
            :help="$t('request.benefitsHelp')"
          />

          <!-- Idea Type (Optional - Multiple Selection) -->
          <div class="form-group">
            <label class="form-label">
              {{ $t('request.ideaTypes') }}
              <span class="optional-text">({{ $t('common.optional') }})</span>
            </label>
            <div class="checkbox-group idea-type-checkbox-group">
              <label
                v-for="type in ideaTypes"
                :key="type.id"
                class="checkbox-label idea-type-option"
                :class="{ 'active': form.idea_types.includes(type.id.toString()) }"
              >
                <input
                  type="checkbox"
                  v-model="form.idea_types"
                  :value="type.id.toString()"
                  class="checkbox-input"
                />
                <span class="checkbox-text">{{ locale === 'ar' ? type.name_ar : type.name }}</span>
                <div class="idea-type-tooltip">
                  {{ locale === 'ar' ? type.description_ar : type.description }}
                </div>
              </label>
            </div>
            <span
              v-if="validationErrors.idea_types"
              class="form-error"
            >{{ validationErrors.idea_types }}</span>
            <span
              v-else
              class="form-help"
            >{{ $t('request.ideaTypesHelp') }}</span>
          </div>

          <!-- Additional Details (Edit Mode Only) -->
          <BaseInput
            v-if="isEditMode"
            v-model="form.additional_details"
            type="textarea"
            :label="$t('request.additionalDetailsLabel')"
            :placeholder="$t('request.additionalDetailsRequestPlaceholder')"
            :rows="4"
            :help="$t('request.additionalDetailsRequestHelp')"
          />

          <!-- File Upload Section -->
          <div class="form-group">
            <label class="form-label">
              {{ $t('request.attachmentsOptional') }}
              <span class="optional-text">{{ $t('request.attachmentsOptionalMax') }}</span>
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
              <label
                for="file"
                class="file-upload-label"
              >
                <svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ $t('request.chooseFilesOrDrag') }}</span>
                <span class="file-types">{{ $t('request.allowedFileTypes') }}</span>
              </label>
            </div>
            <span
              v-if="validationErrors.attachments"
              class="form-error"
            >{{ validationErrors.attachments }}</span>
          </div>

          <!-- Existing Attachments List (when editing) -->
          <div
            v-if="existingAttachments.length > 0"
            class="uploaded-files-section"
          >
            <div class="files-header">
              <h3>{{ $t('request.existingFilesCount', { count: existingAttachments.length }) }}</h3>
            </div>
            <div class="files-list">
              <div
                v-for="(file, index) in existingAttachments"
                :key="'existing-' + file.id"
                class="file-item"
              >
                <div class="file-info">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div class="file-details">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
                <BaseButton
                  variant="ghost"
                  size="sm"
                  @click="removeExistingAttachment(index)"
                  type="button"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Uploaded Files List (new files) -->
          <div
            v-if="uploadedFiles.length > 0"
            class="uploaded-files-section"
          >
            <div class="files-header">
              <h3>{{ $t('request.uploadedFilesCount', { count: uploadedFiles.length }) }}</h3>
            </div>
            <div class="files-list">
              <div
                v-for="(file, index) in uploadedFiles"
                :key="'new-' + index"
                class="file-item"
              >
                <div class="file-info">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clip-rule="evenodd"
                    />
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
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
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
              {{ $t('request.saveAsDraft') }}
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :disabled="isLoading || isDraftSave || !isFormValid"
              :loading="isLoading && !isDraftSave"
            >
              {{ isEditMode ? $t('request.updateResubmit') : $t('request.submitIdea') }}
            </BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Post-Submission Survey Modal -->
      <div
        v-if="showSurveyModal && postSubmissionSurvey"
        class="survey-modal-overlay"
      >
        <div class="survey-modal" @click.stop>
          <div class="survey-modal-header">
            <h2>{{ $t('survey.postSubmissionTitle') }}</h2>
            <p>{{ $t('survey.postSubmissionSubtitle') }}</p>
          </div>

          <div class="survey-modal-body">
            <div class="survey-modal-title">
              {{ locale === 'ar' ? (postSubmissionSurvey.title_ar || postSubmissionSurvey.title) : postSubmissionSurvey.title }}
            </div>
            <p
              v-if="postSubmissionSurvey.description || postSubmissionSurvey.description_ar"
              class="survey-modal-desc"
            >
              {{ locale === 'ar' ? (postSubmissionSurvey.description_ar || postSubmissionSurvey.description) : (postSubmissionSurvey.description || postSubmissionSurvey.description_ar) }}
            </p>

            <div
              v-for="(question, qIndex) in postSubmissionSurvey.questions"
              :key="question.id"
              class="survey-question-card"
            >
              <div class="survey-question-header">
                <span class="survey-question-number">{{ qIndex + 1 }}</span>
                <div class="survey-question-text">
                  <h3>{{ locale === 'ar' ? question.question_text_ar : question.question_text }}</h3>
                  <span
                    v-if="question.is_required"
                    class="survey-required-badge"
                  >{{ $t('survey.required') }}</span>
                  <span v-else class="survey-optional-badge">{{ $t('survey.optional') }}</span>
                </div>
              </div>

              <!-- Multiple Choice -->
              <div
                v-if="question.question_type === 'multiple_choice'"
                class="survey-choice-options"
              >
                <button
                  v-for="option in question.options"
                  :key="option.id"
                  type="button"
                  :class="['survey-choice-btn', { selected: surveyAnswers[question.id]?.option_id === option.id }]"
                  @click="selectSurveyOption(question.id, option.id)"
                >
                  {{ locale === 'ar' ? option.option_text_ar : option.option_text }}
                </button>
              </div>

              <!-- Satisfaction Rating -->
              <div
                v-else-if="question.question_type === 'satisfaction'"
                class="survey-satisfaction-scale"
              >
                <button
                  v-for="option in question.options"
                  :key="option.id"
                  type="button"
                  :class="['survey-satisfaction-btn', `satisfaction-${option.option_value}`, { selected: surveyAnswers[question.id]?.option_id === option.id }]"
                  @click="selectSurveyOption(question.id, option.id)"
                >
                  <span class="satisfaction-value">{{ option.option_value }}</span>
                  <span class="satisfaction-label">{{ locale === 'ar' ? option.option_text_ar : option.option_text }}</span>
                </button>
              </div>

              <!-- Text Area -->
              <div
                v-else-if="question.question_type === 'text'"
                class="survey-text-input"
              >
                <textarea
                  v-model="surveyAnswers[question.id].text_answer"
                  rows="3"
                  :placeholder="$t('survey.textPlaceholder')"
                  class="survey-text-area"
                ></textarea>
              </div>
            </div>

            <div v-if="surveyValidationError" class="survey-validation-error">
              {{ surveyValidationError }}
            </div>
          </div>

          <div class="survey-modal-footer">
            <button
              type="button"
              class="survey-btn-skip"
              @click="closeSurveyModal"
              :disabled="isSubmittingSurvey"
            >
              {{ $t('survey.skip') }}
            </button>
            <button
              type="button"
              class="survey-btn-submit"
              @click="submitPostSubmissionSurvey"
              :disabled="isSubmittingSurvey"
            >
              {{ isSubmittingSurvey ? $t('survey.submitting') : $t('survey.submitSurvey') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "vue-i18n";
import axios from "axios";
import AppLayout from "../components/AppLayout.vue";
import BaseCard from "../components/BaseCard.vue";
import BaseButton from "../components/BaseButton.vue";
import BaseInput from "../components/BaseInput.vue";
import BaseSelect from "../components/BaseSelect.vue";
import { API_URL } from "../config/api";
import { useAlert } from "../composables/useAlert";
import TableHeader from "../components/common/TableHeader.vue";
import { objectToQueryString } from "../services/handle";
import { httpRequest } from "../services/api";
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t, locale } = useI18n();
const { showSuccess, showError } = useAlert();

const form = ref({
  title: "",
  description: "",
  idea_types: [],
  department: "",
  benefits: "",
  additional_details: "",
  idea_ownership_type: "individual",
  employees: [],
});
const uploadedFiles = ref([]);
const existingAttachments = ref([]);
const attachmentsToDelete = ref([]);
const fileInput = ref(null);
const error = ref(null);
const success = ref(null);
const isLoading = ref(false);
const isDraftSave = ref(false);
const validationErrors = ref({});
const touched = ref({});
const isEditMode = ref(false);
const formKey = ref(0);
const departments = ref([]);
const ideaTypes = ref([]);
const employeeSearchQuery = ref("");
const employeeSearchResults = ref([]);
const isSearching = ref(false);
let searchTimeout = null;

// Post-submission survey state
const postSubmissionSurvey = ref(null);
const showSurveyModal = ref(false);
const surveyAnswers = ref({});
const isSubmittingSurvey = ref(false);
const surveyValidationError = ref(null);
const newRequestId = ref(null);

const pageBreadcrumbs = computed(() => [
  { name: t("nav.dashboard"), link: "/" },
  { name: t("nav.myRequests"), link: "/requests" },
  {
    name: isEditMode.value ? t("request.editRequest") : t("request.submitNewIdea"),
    link: "",
  },
]);
// Idea Type Options (computed from fetched data with bilingual support)
const ideaTypeOptions = computed(() => {
  return ideaTypes.value.map((type) => ({
    value: type.id.toString(),
    label: locale.value === "ar" ? type.name_ar : type.name,
  }));
});

// Department Options (will be loaded from API + Unknown)
const departmentOptions = computed(() => {
  const deptList = departments.value.map((dept) => ({
    value: dept.id.toString(),
    label: dept.name,
  }));

  return [...deptList, { value: "unknown", label: t("common.unknown") }];
});

// Form validation
const isFormValid = computed(() => {
  return (
    form.value.title.length > 0 &&
    form.value.title.length <= 200 &&
    // form.value.description.length >= 25 &&
    form.value.department !== "" &&
    uploadedFiles.value.length <= 5
  );
});

onMounted(async () => {
  await Promise.all([loadDepartments(), loadIdeaTypes()]);

  // Check if editing existing request
  if (route.params.id) {
    isEditMode.value = true;
    await loadRequest(route.params.id);
  }
});

const loadDepartments = async () => {
  try {
    const response = await httpRequest(`/departments`);
    departments.value = response.data.departments || [];
  } catch (err) {
    console.error("Failed to load departments:", err);
    // Set default departments if API fails
    departments.value = [
      { id: 1, name: "Department A" },
      { id: 2, name: "Technical" },
      { id: 3, name: "Finance" },
      { id: 4, name: "Legal" },
      { id: 5, name: "Strategy" },
      { id: 6, name: "HR" },
    ];
  }
};

const loadIdeaTypes = async () => {
  try {
    const response = await httpRequest(`/idea-types`);
    ideaTypes.value = response.data.ideaTypes || [];
  } catch (err) {
    console.error("Failed to load idea types:", err);
    ideaTypes.value = [];
  }
};

const loadRequest = async (id) => {
  try {
    const response = await httpRequest(`/requests/${id}`);
    const request = response.data.request;
    console.log("============ LOADING REQUEST FOR EDIT ============");
    console.log("Full request object:", request);
    console.log("Request.idea_ownership:", request.idea_ownership);
    console.log("Type of idea_ownership:", typeof request.idea_ownership);
    console.log("Request.idea_type_id (category):", request.idea_type_id);
    console.log("Request.employees:", request.employees);

    // Determine ownership type - use idea_ownership field (not idea_type which is overwritten by relationship)
    let ownershipType = "individual"; // Default
    if (request.idea_ownership) {
      ownershipType = String(request.idea_ownership).toLowerCase().trim();
      // Ensure it's exactly 'individual' or 'shared'
      if (ownershipType !== "individual" && ownershipType !== "shared") {
        console.warn(
          "Invalid idea_ownership value:",
          ownershipType,
          "- defaulting to individual"
        );
        ownershipType = "individual";
      }
    }
    console.log("Determined ownership type:", ownershipType);

    // Update form properties individually for better Vue reactivity
    form.value.title = request.title || "";
    form.value.description = request.description || "";
    form.value.idea_types = request.idea_types && Array.isArray(request.idea_types)
      ? request.idea_types.map(type => type.id.toString())
      : [];
    form.value.department = request.department_id?.toString() || "unknown";
    form.value.benefits = request.benefits || "";
    form.value.additional_details = request.additional_details || "";
    form.value.employees = Array.isArray(request.employees)
      ? [...request.employees]
      : [];

    // Update idea_ownership_type after a tick to ensure Vue reactivity updates the radio buttons
    await nextTick();
    form.value.idea_ownership_type = ownershipType;

    // Increment formKey to force Vue to re-render the radio buttons with the new value
    await nextTick();
    formKey.value++;

    // Load existing attachments
    if (request.attachments && Array.isArray(request.attachments)) {
      existingAttachments.value = request.attachments.map(att => ({
        id: att.id,
        name: att.file_name,
        file_name: att.file_name,
        file_path: att.file_path,
        file_type: att.file_type,
        size: att.file_size,
        file_size: att.file_size,
        isExisting: true
      }));
      console.log("Loaded existing attachments:", existingAttachments.value);
    }

    console.log("============ FORM AFTER LOADING ============");
    console.log("form.idea_ownership_type:", form.value.idea_ownership_type);
    console.log(
      "Type of form.idea_ownership_type:",
      typeof form.value.idea_ownership_type
    );
    console.log(
      'form.idea_ownership_type === "individual":',
      form.value.idea_ownership_type === "individual"
    );
    console.log(
      'form.idea_ownership_type === "shared":',
      form.value.idea_ownership_type === "shared"
    );
    console.log("form.employees length:", form.value.employees.length);
    console.log("===============================================");
  } catch (err) {
    console.error("Failed to load request:", err);
    showError(t("request.errorMessages.loadRequestFailed"));
  }
};

// Employee search function
const searchEmployees = async () => {
  if (employeeSearchQuery.value.length < 2) {
    employeeSearchResults.value = [];
    return;
  }
  // Debounce search
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    const params = { query: employeeSearchQuery.value };
    try {
      let queryString = objectToQueryString(params);
      const response = await httpRequest(`/employees/search?${queryString}`);

      employeeSearchResults.value = response.data.data || [];
    } catch (err) {
      console.error("Failed to search employees:", err);
      employeeSearchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

// Add employee to the list
const addEmployee = (employee) => {
  // Check if employee already added
  const exists = form.value.employees.some(
    (emp) => emp.employee_email === employee.email
  );
  if (!exists) {
    form.value.employees.push({
      employee_name: employee.name,
      employee_email: employee.email,
      employee_department: employee.department,
      employee_title: employee.title,
    });
  }

  // Clear search
  employeeSearchQuery.value = "";
  employeeSearchResults.value = [];
};

// Remove employee from the list
const removeEmployee = (index) => {
  form.value.employees.splice(index, 1);
};

// Validate a single field
const validateField = (fieldName) => {
  const errors = { ...validationErrors.value };

  switch (fieldName) {
    case "title":
      if (!form.value.title || form.value.title.trim() === "") {
        errors.title = t("request.validationErrors.titleRequired");
      } else if (form.value.title.length > 200) {
        errors.title = t("request.validationErrors.titleTooLong");
      } else {
        delete errors.title;
      }
      break;

    // case "description":
    //   if (!form.value.description || form.value.description.trim() === "") {
    //     errors.description = t("request.validationErrors.descriptionRequired");
    //   } else if (form.value.description.length < 25) {
    //     errors.description = t("request.validationErrors.descriptionTooShort");
    //   } else {
    //     delete errors.description;
    //   }
    //   break;

    case "department":
      if (!form.value.department) {
        errors.department = t("request.validationErrors.pathRequired");
      } else {
        delete errors.department;
      }
      break;

    case "attachments":
      if (uploadedFiles.value.length > 5) {
        errors.attachments = t("request.validationErrors.maxFilesExceeded", {
          max: 5,
        });
      } else {
        delete errors.attachments;
      }
      break;
  }

  validationErrors.value = errors;
};

// Handle field blur - mark as touched and validate
const handleBlur = (fieldName) => {
  touched.value[fieldName] = true;
  validateField(fieldName);
};

// Validate all fields
const validateForm = () => {
  // Mark all fields as touched
  touched.value = {
    title: true,
    description: true,
    department: true,
    attachments: true,
  };

  const errors = {};

  // Title validation
  if (!form.value.title || form.value.title.trim() === "") {
    errors.title = t("request.validationErrors.titleRequired");
  } else if (form.value.title.length > 200) {
    errors.title = t("request.validationErrors.titleTooLong");
  }

  // Description validation
  if (!form.value.description || form.value.description.trim() === "") {
    errors.description = t("request.validationErrors.descriptionRequired");
  }
  //  else if (form.value.description.length < 25) {
  //   errors.description = t("request.validationErrors.descriptionTooShort");
  // }

  // Department validation
  if (!form.value.department) {
    errors.department = t("request.validationErrors.pathRequired");
  }

  // File validation
  if (uploadedFiles.value.length > 5) {
    errors.attachments = t("request.validationErrors.maxFilesExceeded", {
      max: 5,
    });
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);

  // Check total file count
  if (uploadedFiles.value.length + files.length > 5) {
    validationErrors.value.attachments = t(
      "request.validationErrors.maxFilesExceeded",
      { max: 5 }
    );
    return;
  }

  // Validate file types
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ];
  const invalidFiles = files.filter(
    (file) => !allowedTypes.includes(file.type)
  );

  if (invalidFiles.length > 0) {
    validationErrors.value.attachments = t(
      "request.validationErrors.invalidFileType"
    );
    return;
  }

  // Add valid files
  uploadedFiles.value.push(...files);
  validationErrors.value.attachments = "";

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1);
  validationErrors.value.attachments = "";
};

const removeExistingAttachment = (index) => {
  const attachment = existingAttachments.value[index];
  if (attachment && attachment.id) {
    attachmentsToDelete.value.push(attachment.id);
  }
  existingAttachments.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return t("common.zeroBytes");
  const k = 1024;
  const sizes = [
    t("common.bytes"),
    t("common.kb"),
    t("common.mb"),
    t("common.gb"),
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const handleSubmit = async () => {
  if (!validateForm()) {
    showError(t("request.validationErrors.fixValidationErrors"));
    return;
  }

  try {
    isLoading.value = true;
    const formData = new FormData();
    formData.append("title", form.value.title);
    formData.append("description", form.value.description);

    // Append multiple idea types
    if (form.value.idea_types && form.value.idea_types.length > 0) {
      form.value.idea_types.forEach((typeId, index) => {
        formData.append(`idea_types[${index}]`, typeId);
      });
    }

    formData.append("department", form.value.department);
    formData.append("benefits", form.value.benefits || "");
    formData.append("status", "pending");
    formData.append("idea_ownership_type", form.value.idea_ownership_type);

    if (isEditMode.value && form.value.additional_details) {
      formData.append("additional_details", form.value.additional_details);
    }

    // Append employees if shared idea
    if (
      form.value.idea_ownership_type === "shared" &&
      form.value.employees.length > 0
    ) {
      form.value.employees.forEach((employee, index) => {
        formData.append(
          `employees[${index}][employee_name]`,
          employee.employee_name
        );
        formData.append(
          `employees[${index}][employee_email]`,
          employee.employee_email || ""
        );
        formData.append(
          `employees[${index}][employee_department]`,
          employee.employee_department || ""
        );
        formData.append(
          `employees[${index}][employee_title]`,
          employee.employee_title || ""
        );
      });
    }

    // Append new files only
    uploadedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    // Append attachments to delete (when editing)
    if (attachmentsToDelete.value.length > 0) {
      attachmentsToDelete.value.forEach((id, index) => {
        formData.append(`delete_attachments[${index}]`, id);
      });
    }

    let response;
    if (isEditMode.value) {
      response = await axios.post(
        `${API_URL}/requests/${route.params.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      response = await axios.post(`${API_URL}/requests`, formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    showSuccess(
      isEditMode.value
        ? t("request.successMessages.ideaUpdated")
        : t("request.successMessages.ideaSubmitted")
    );

    // For new submissions (not edits), check for post-submission survey
    if (!isEditMode.value) {
      // Capture the new request ID from the response
      const createdRequestId = response.data.request?.id;
      newRequestId.value = createdRequestId;

      try {
        const surveyRes = await httpRequest('/surveys/trigger/post_submission');
        const surveyData = surveyRes.data.survey;
        const respondedIds = surveyRes.data.responded_request_ids || [];

        // Show survey if it exists and user hasn't responded for this specific request
        if (surveyData && createdRequestId && !respondedIds.includes(createdRequestId)) {
          postSubmissionSurvey.value = surveyData;
          // Initialize answers
          const answers = {};
          surveyData.questions.forEach((q) => {
            answers[q.id] = { question_id: q.id, option_id: null, text_answer: "" };
          });
          surveyAnswers.value = answers;
          showSurveyModal.value = true;
          return; // Don't redirect yet
        }
      } catch (surveyErr) {
        console.error("Failed to check post-submission survey:", surveyErr);
      }
    }

    setTimeout(() => {
      router.push("/requests");
    }, 2000);
  } catch (err) {
    showError(
      err.response?.data?.message || t("request.errorMessages.submitFailed")
    );
  } finally {
    isLoading.value = false;
  }
};

const saveDraft = async () => {
  if (!form.value.title || !form.value.description) {
    showError(t("request.validationErrors.draftRequiresTitle"));
    return;
  }

  try {
    isDraftSave.value = true;
    console.log("============ SAVING DRAFT ============");
    console.log(
      "Current form.idea_ownership_type:",
      form.value.idea_ownership_type
    );
    console.log("Type:", typeof form.value.idea_ownership_type);

    const formData = new FormData();
    formData.append("title", form.value.title);
    formData.append("description", form.value.description);

    // Append multiple idea types
    if (form.value.idea_types && form.value.idea_types.length > 0) {
      form.value.idea_types.forEach((typeId, index) => {
        formData.append(`idea_types[${index}]`, typeId);
      });
    }

    formData.append("department", form.value.department || "");
    formData.append("benefits", form.value.benefits || "");
    formData.append("status", "draft");
    formData.append("idea_ownership_type", form.value.idea_ownership_type);

    console.log("Sent idea_ownership_type:", form.value.idea_ownership_type);
    console.log("=======================================");

    // Append employees if shared idea
    if (
      form.value.idea_ownership_type === "shared" &&
      form.value.employees.length > 0
    ) {
      form.value.employees.forEach((employee, index) => {
        formData.append(
          `employees[${index}][employee_name]`,
          employee.employee_name
        );
        formData.append(
          `employees[${index}][employee_email]`,
          employee.employee_email || ""
        );
        formData.append(
          `employees[${index}][employee_department]`,
          employee.employee_department || ""
        );
        formData.append(
          `employees[${index}][employee_title]`,
          employee.employee_title || ""
        );
      });
    }

    // Append new files only
    uploadedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    // Append attachments to delete (when editing)
    if (attachmentsToDelete.value.length > 0) {
      attachmentsToDelete.value.forEach((id, index) => {
        formData.append(`delete_attachments[${index}]`, id);
      });
    }

    // Use update endpoint if editing existing request
    const url = isEditMode.value
      ? `${API_URL}/requests/${route.params.id}`
      : `${API_URL}/requests`;

    await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    showSuccess(
      isEditMode.value
        ? t("request.successMessages.ideaUpdated")
        : t("request.successMessages.draftSaved")
    );

    setTimeout(() => {
      router.push("/requests");
    }, 2000);
  } catch (err) {
    showError(
      err.response?.data?.message || t("request.errorMessages.draftFailed")
    );
  } finally {
    isDraftSave.value = false;
  }
};

// Post-submission survey methods
const selectSurveyOption = (questionId, optionId) => {
  surveyAnswers.value[questionId].option_id = optionId;
  surveyValidationError.value = null;
};

const submitPostSubmissionSurvey = async () => {
  surveyValidationError.value = null;

  // Validate required questions
  for (const question of postSubmissionSurvey.value.questions) {
    if (!question.is_required) continue;
    const answer = surveyAnswers.value[question.id];
    if (question.question_type === "text" && !answer.text_answer?.trim()) {
      surveyValidationError.value = t("survey.allRequiredMessage");
      return;
    }
    if (["multiple_choice", "satisfaction"].includes(question.question_type) && !answer.option_id) {
      surveyValidationError.value = t("survey.allRequiredMessage");
      return;
    }
  }

  try {
    isSubmittingSurvey.value = true;
    const answersArray = Object.values(surveyAnswers.value).map((a) => ({
      question_id: a.question_id,
      option_id: a.option_id,
      text_answer: a.text_answer || null,
    }));

    await axios.post(
      `${API_URL}/surveys/${postSubmissionSurvey.value.id}/submit`,
      { answers: answersArray, request_id: newRequestId.value },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    showSuccess(t("messages.success.surveySubmitted"));
    showSurveyModal.value = false;
    setTimeout(() => {
      router.push("/requests");
    }, 1000);
  } catch (err) {
    showError(err.response?.data?.message || "Failed to submit survey");
  } finally {
    isSubmittingSurvey.value = false;
  }
};

const closeSurveyModal = () => {
  showSurveyModal.value = false;
  router.push("/requests");
};

const goBack = () => {
  router.push("/dashboard");
};
</script>

<style scoped>
.new-request {
  max-width: 1440px;
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

/* Radio Group */
.radio-group {
  display: flex;
  gap: var(--spacing-6);
  margin-top: var(--spacing-2);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary-600);
}

.form-help {
  display: block;
  margin-top: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Employee Search */
.employee-search-container {
  position: relative;
  margin-top: var(--spacing-2);
}

.employee-search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.employee-search-input:focus {
  outline: none;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--spacing-2);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-border);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: var(--color-primary-50);
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.employee-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.no-results {
  padding: var(--spacing-4);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.searching-indicator {
  padding: var(--spacing-2);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Selected Employees */
.selected-employees {
  margin-top: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.employees-header h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-3) 0;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.employee-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.employee-details strong {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.employee-meta-info {
  display: flex;
  gap: var(--spacing-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.employee-meta-info span:not(:last-child)::after {
  content: "•";
  margin-left: var(--spacing-3);
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

/* Idea Type Radio Group with Tooltips */
.idea-type-radio-group,
.idea-type-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-3);
}

.idea-type-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.idea-type-option:hover {
  background: rgba(2, 115, 94, 0.05);
  border-color: #02735e;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.idea-type-option.active {
  background: rgba(2, 115, 94, 0.05);
  border-color: #02735e;
  box-shadow: 0 0 0 3px rgba(2, 115, 94, 0.1);
}

.idea-type-option .radio-input,
.idea-type-option .checkbox-input {
  flex-shrink: 0;
  accent-color: #02735e;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.idea-type-option .radio-text,
.idea-type-option .checkbox-text {
  flex: 1;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Tooltip */
.idea-type-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-gray-900);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  white-space: normal;
  max-width: 300px;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: 100;
  box-shadow: var(--shadow-xl);
  pointer-events: none;
}

.idea-type-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-gray-900);
}

.idea-type-option:hover .idea-type-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
}

/* RTL Support for Tooltips */
html[dir="rtl"] .idea-type-tooltip {
  text-align: right;
}

@media (max-width: 768px) {
  .idea-type-radio-group,
  .idea-type-checkbox-group {
    grid-template-columns: 1fr;
  }

  .idea-type-tooltip {
    max-width: 250px;
    min-width: 150px;
  }
}

/* Post-Submission Survey Modal */
.survey-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.survey-modal {
  background: white;
  border-radius: var(--radius-xl);
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.survey-modal-header {
  padding: var(--spacing-6) var(--spacing-8);
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
}

.survey-modal-header h2 {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-size-xl);
}

.survey-modal-header p {
  margin: 0;
  opacity: 0.9;
  font-size: var(--font-size-sm);
}

.survey-modal-body {
  padding: var(--spacing-6) var(--spacing-8);
  overflow-y: auto;
  flex: 1;
}

.survey-modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.survey-modal-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

.survey-question-card {
  padding: var(--spacing-4) 0;
  border-bottom: 1px solid var(--color-border);
}

.survey-question-card:last-of-type {
  border-bottom: none;
}

.survey-question-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.survey-question-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  flex-shrink: 0;
}

.survey-question-text {
  flex: 1;
}

.survey-question-text h3 {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.survey-required-badge {
  font-size: var(--font-size-xs);
  color: #ef4444;
  font-weight: var(--font-weight-medium);
}

.survey-optional-badge {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.survey-choice-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.survey-choice-btn {
  padding: var(--spacing-2) var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.survey-choice-btn:hover {
  border-color: #02735e;
  background: rgba(2, 115, 94, 0.05);
}

.survey-choice-btn.selected {
  border-color: #02735e;
  background: #02735e;
  color: white;
}

.survey-satisfaction-scale {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.survey-satisfaction-btn {
  flex: 1;
  min-width: 80px;
  padding: var(--spacing-2);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.survey-satisfaction-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.survey-satisfaction-btn .satisfaction-value {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-1);
}

.survey-satisfaction-btn .satisfaction-label {
  display: block;
  font-size: 10px;
  color: var(--color-text-secondary);
}

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

.survey-text-area {
  width: 100%;
  padding: var(--spacing-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.survey-text-area:focus {
  outline: none;
  border-color: #02735e;
}

.survey-validation-error {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background: #fef2f2;
  color: #ef4444;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  border: 1px solid #fecaca;
}

.survey-modal-footer {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-8);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.survey-btn-skip {
  flex: 1;
  padding: var(--spacing-3) var(--spacing-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.survey-btn-skip:hover:not(:disabled) {
  background: var(--color-gray-100);
}

.survey-btn-submit {
  flex: 1;
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #02735e, #015a4a);
  color: white;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.survey-btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.survey-btn-submit:disabled,
.survey-btn-skip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .survey-satisfaction-scale {
    flex-direction: column;
  }
  .survey-satisfaction-btn {
    min-width: unset;
  }
  .survey-choice-options {
    flex-direction: column;
  }
  .survey-modal-footer {
    flex-direction: column;
  }
}
</style>
