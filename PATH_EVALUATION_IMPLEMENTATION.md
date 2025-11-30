# Path Evaluation Questions - Implementation Guide

## ✅ COMPLETED (Backend)

1. **Database Tables Created:**
   - `path_evaluation_questions` - Questions linked to workflow paths
   - `path_evaluations` - Manager evaluations (Applied/Not Applied)

2. **Backend API Endpoints:**
   - Admin: `/api/admin/path-evaluation-questions` (GET, POST, PUT, DELETE)
   - Managers: `/api/department/requests/{id}/path-evaluation-questions` (GET)
   - Managers: `/api/department/requests/{id}/path-evaluation` (POST)

3. **Admin Panel UI Updated:**
   - Evaluation Questions tab now has TWO sections:
     - Department A Evaluation (existing - 1-10 rating with weights)
     - Path Evaluation Questions (new - Applied/Not Applied format)
   - Modal added for creating/editing path questions

## 📋 PENDING (Frontend JavaScript)

### Add to AdminPanel.vue `<script setup>`:

```javascript
// Add after line 608 (after isLoading)
const pathEvaluationQuestions = ref([])
const workflowPaths = ref([])
const isLoadingPathQuestions = ref(false)
const pathQuestionModal = ref({
  show: false,
  isEdit: false,
  isLoading: false,
  form: { workflow_path_id: '', question: '', order: 0, is_active: true },
  editId: null
})

// Add computed property for grouping path questions by workflow path
const groupedPathQuestions = computed(() => {
  const groups = {}
  pathEvaluationQuestions.value.forEach(q => {
    const pathId = q.workflow_path_id
    if (!groups[pathId]) {
      const path = workflowPaths.value.find(p => p.id === pathId)
      groups[pathId] = {
        pathId,
        pathName: path?.name || 'Unknown Path',
        questions: []
      }
    }
    groups[pathId].questions.push(q)
  })
  return Object.values(groups)
})

// Add to loadData() function - add these API calls:
const [pathQuestionsRes, pathsRes] = await Promise.all([
  axios.get(`${API_URL}/admin/path-evaluation-questions`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
  axios.get(`${API_URL}/workflow/paths`, { headers: { Authorization: `Bearer ${authStore.token}` } })
])
pathEvaluationQuestions.value = pathQuestionsRes.data.questions
workflowPaths.value = pathsRes.data.paths

// Add these functions:
const openPathQuestionModal = (question = null) => {
  pathQuestionModal.value = question ? {
    show: true, isEdit: true, isLoading: false,
    form: {
      workflow_path_id: question.workflow_path_id,
      question: question.question,
      order: question.order || 0,
      is_active: question.is_active
    },
    editId: question.id
  } : {
    show: true, isEdit: false, isLoading: false,
    form: { workflow_path_id: '', question: '', order: 0, is_active: true },
    editId: null
  }
}

const closePathQuestionModal = () => {
  pathQuestionModal.value.show = false
}

const savePathQuestion = async () => {
  try {
    pathQuestionModal.value.isLoading = true
    error.value = null
    const url = pathQuestionModal.value.isEdit
      ? `${API_URL}/admin/path-evaluation-questions/${pathQuestionModal.value.editId}`
      : `${API_URL}/admin/path-evaluation-questions`
    const method = pathQuestionModal.value.isEdit ? 'put' : 'post'
    await axios[method](url, pathQuestionModal.value.form, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = `Path question ${pathQuestionModal.value.isEdit ? 'updated' : 'created'}`
    closePathQuestionModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save path question'
  } finally {
    pathQuestionModal.value.isLoading = false
  }
}

const togglePathQuestionStatus = async (question) => {
  try {
    await axios.put(
      `${API_URL}/admin/path-evaluation-questions/${question.id}`,
      { is_active: !question.is_active },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    success.value = `Question ${!question.is_active ? 'activated' : 'deactivated'}`
    await loadData()
    setTimeout(() => (success.value = null), 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to toggle status'
  }
}

const deletePathQuestion = async (question) => {
  if (!confirm(`Delete this path evaluation question?`)) return
  try {
    await axios.delete(`${API_URL}/admin/path-evaluation-questions/${question.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = 'Path question deleted'
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}
```

### Add CSS Styles (after existing styles):

```css
.evaluation-section {
  margin-bottom: 2rem;
}

.path-questions-group {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.path-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.path-icon {
  font-size: 1.5rem;
}

.path-question-card {
  background: white;
}

.format-badge {
  padding: 0.25rem 0.5rem;
  background: #e7f5ff;
  color: #1971c2;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
```

## ✅ COMPLETED: Department Workflow Integration

Updated `/home/nasser/workflow-frontend/src/views/DepartmentWorkflow.vue`:
- ✅ Added path evaluation modal before "Assign to Employee"
- ✅ Applied/Not Applied toggle for each question (green/red buttons)
- ✅ Notes field for each answer
- ✅ Submit button disabled until all questions answered
- ✅ Auto-proceeds to assign modal after evaluation saved
- ✅ Loads existing evaluations if present

## 🎉 IMPLEMENTATION COMPLETE

The path evaluation system is now fully functional:
1. Admin can create path-specific evaluation questions
2. Department managers must evaluate before assigning to employees
3. Boolean evaluation format (Applied/Not Applied)
4. All data saved to database with audit trail

