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

          <!-- Department -->
          <BaseSelect
            v-model="form.department"
            :label="$t('request.department')"
            :placeholder="$t('request.departmentPlaceholder')"
            required
            :options="departmentOptions"
            :error="touched.department ? validationErrors.department : ''"
            :help="$t('request.departmentHelp')"
            @blur="handleBlur('department')"
          />

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
              {{ $t('request.collaboratingEmployees') }}
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
            :label="$t('request.benefits')"
            :placeholder="$t('request.benefitsPlaceholder')"
            :rows="4"
            :help="$t('request.benefitsHelp')"
          />

          <!-- Idea Type (Optional) -->
          <div class="form-group">
            <label class="form-label">
              {{ $t('request.ideaType') }}
              <span class="optional-text">({{ $t('common.optional') }})</span>
            </label>
            <div class="radio-group idea-type-radio-group">
              <label
                v-for="type in ideaTypes"
                :key="type.id"
                class="radio-label idea-type-option"
                :class="{ 'active': form.idea_type === type.id.toString() }"
              >
                <input
                  type="radio"
                  v-model="form.idea_type"
                  :value="type.id.toString()"
                  class="radio-input"
                />
                <span class="radio-text">{{ locale === 'ar' ? type.name_ar : type.name }}</span>
                <div class="idea-type-tooltip">
                  {{ locale === 'ar' ? type.description_ar : type.description }}
                </div>
              </label>
            </div>
            <span
              v-if="validationErrors.idea_type"
              class="form-error"
            >{{ validationErrors.idea_type }}</span>
            <span
              v-else
              class="form-help"
            >{{ $t('request.ideaTypeHelp') }}</span>
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

          <!-- Uploaded Files List -->
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
                :key="index"
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
  idea_type: "",
  department: "",
  benefits: "",
  additional_details: "",
  idea_ownership_type: "individual",
  employees: [],
});
const uploadedFiles = ref([]);
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
const pageBreadcrumbs = [
  { name: t("nav.dashboard"), link: "/" },

  { name: t("nav.myRequests"), link: "/requests" },
  {
    name: isEditMode ? t("request.editRequest") : t("request.submitNewIdea"),
    link: "",
  },
];
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
    form.value.description.length >= 25 &&
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
    form.value.idea_type = request.idea_type_id?.toString() || "";
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
    try {
      const response = await axios.get(`${API_URL}/employees/search`, {
        params: { query: employeeSearchQuery.value },
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });

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

    case "description":
      if (!form.value.description || form.value.description.trim() === "") {
        errors.description = t("request.validationErrors.descriptionRequired");
      } else if (form.value.description.length < 25) {
        errors.description = t("request.validationErrors.descriptionTooShort");
      } else {
        delete errors.description;
      }
      break;

    case "department":
      if (!form.value.department) {
        errors.department = t("request.validationErrors.departmentRequired");
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
  } else if (form.value.description.length < 25) {
    errors.description = t("request.validationErrors.descriptionTooShort");
  }

  // Department validation
  if (!form.value.department) {
    errors.department = t("request.validationErrors.departmentRequired");
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
    formData.append("idea_type", form.value.idea_type);
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

    // Append files
    uploadedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

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
    formData.append("idea_type", form.value.idea_type || "");
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

    // Append files
    uploadedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

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
.idea-type-radio-group {
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

.idea-type-option .radio-input {
  flex-shrink: 0;
  accent-color: #02735e;
}

.idea-type-option .radio-text {
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
  .idea-type-radio-group {
    grid-template-columns: 1fr;
  }

  .idea-type-tooltip {
    max-width: 250px;
    min-width: 150px;
  }
}
</style>
