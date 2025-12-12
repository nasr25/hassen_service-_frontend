<template>
  <AppLayout>
    <div class="admin-panel">
      <!-- Welcome Header -->
      <div class="welcome-section">
        <div>
          <h1>⚙️ {{ $t('admin.title') }}</h1>
          <p class="welcome-subtitle">{{ $t('admin.subtitle') }}</p>
        </div>
        <button @click="refresh" class="btn-refresh">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          {{ $t('common.refresh') }}
        </button>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'departments' }]" @click="activeTab = 'departments'">
          🏢 {{ $t('admin.departments') }}
        </button>
        <button :class="['tab', { active: activeTab === 'users' }]" @click="activeTab = 'users'">
          👥 {{ $t('admin.users') }}
        </button>
        <button :class="['tab', { active: activeTab === 'assignments' }]" @click="activeTab = 'assignments'">
          🔗 {{ $t('admin.assignments') }}
        </button>
        <button :class="['tab', { active: activeTab === 'evaluations' }]" @click="activeTab = 'evaluations'">
          📋 {{ $t('admin.evaluationQuestions') }}
        </button>
        <button :class="['tab', { active: activeTab === 'permissions' }]" @click="activeTab = 'permissions'">
          🔐 {{ $t('admin.permissionsRoles') }}
        </button>
        <button :class="['tab', { active: activeTab === 'ideaTypes' }]" @click="activeTab = 'ideaTypes'">
          💡 {{ $t('admin.ideaTypes') }}
        </button>
        <button :class="['tab', { active: activeTab === 'workflowPaths' }]" @click="activeTab = 'workflowPaths'">
          🔀 {{ $t('admin.workflowPaths') }}
        </button>
        <router-link to="/admin/settings" class="tab tab-link">
          ⚙️ {{ $t('nav.settings') }}
        </router-link>
        <router-link to="/admin/email-templates" class="tab tab-link">
          📧 {{ $t('admin.emailTemplates') }}
        </router-link>
        <router-link to="/admin/audit-logs" class="tab tab-link">
          📜 {{ $t('admin.auditLogs') }}
        </router-link>
      </div>

      <div v-if="activeTab === 'departments'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.departments') }} ({{ departments.length }})</h2>
          <button @click="openDepartmentModal()" class="btn-primary">➕ {{ $t('admin.addDepartment') }}</button>
        </div>
        <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ $t('admin.name') }}</th>
                <th>{{ $t('admin.code') }}</th>
                <th>{{ $t('admin.members') }}</th>
                <th>{{ $t('admin.status') }}</th>
                <th>{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dept in departments" :key="dept.id">
                <td>
                  <strong>{{ dept.name }}</strong>
                  <span v-if="dept.is_department_a" class="badge badge-primary">{{ $t('admin.deptA') }}</span>
                </td>
                <td><code>{{ dept.code }}</code></td>
                <td>{{ dept.users?.length || 0 }}</td>
                <td>
                  <span :class="['badge', dept.is_active ? 'badge-success' : 'badge-inactive']">
                    {{ dept.is_active ? $t('admin.active') : $t('admin.inactive') }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="openDepartmentModal(dept)" class="btn-icon">✏️</button>
                  <button @click="deleteDepartment(dept)" class="btn-icon btn-danger">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.users') }} ({{ users.length }})</h2>
          <button @click="openUserModal()" class="btn-primary">➕ {{ $t('admin.addUser') }}</button>
        </div>
        <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ $t('admin.name') }}</th>
                <th>{{ $t('admin.email') }}</th>
                <th>{{ $t('admin.role') }}</th>
                <th>{{ $t('admin.departments') }}</th>
                <th>{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td><strong>{{ user.name }}</strong></td>
                <td><code>{{ user.email }}</code></td>
                <td><span :class="['badge', `badge-${user.role}`]">{{ user.role.toUpperCase() }}</span></td>
                <td>
                  <span v-if="user.departments && user.departments.length > 0" class="dept-badges">
                    <span v-for="dept in user.departments" :key="dept.id" class="badge badge-dept">
                      {{ dept.code }}
                    </span>
                  </span>
                  <span v-else class="text-muted">{{ $t('common.none') }}</span>
                </td>
                <td class="actions">
                  <button @click="openUserModal(user)" class="btn-icon">✏️</button>
                  <button @click="deleteUser(user)" :disabled="user.id === authStore.user?.id" class="btn-icon btn-danger">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'assignments'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.assignments') }}</h2>
          <button @click="openAssignmentModal()" class="btn-primary">➕ {{ $t('admin.assignUser') }}</button>
        </div>
        <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else class="assignments-grid">
          <div v-for="dept in departments" :key="dept.id" class="assignment-card">
            <div class="assignment-header">
              <h3>{{ dept.name }}</h3>
              <span class="badge badge-info">{{ dept.users?.length || 0 }}</span>
            </div>
            <div v-if="!dept.users || dept.users.length === 0" class="empty-message">{{ $t('admin.noMembers') }}</div>
            <div v-else class="members-list">
              <div v-for="user in dept.users" :key="user.id" class="member-item">
                <div class="member-info">
                  <strong>{{ user.name }}</strong>
                  <code>{{ user.email }}</code>
                  <span :class="['badge', `badge-${user.pivot.role}`]">{{ user.pivot.role }}</span>
                </div>
                <div class="member-actions">
                  <button @click="openEditRoleModal(user, dept)" class="btn-icon-small">🔄</button>
                  <button @click="removeUserFromDept(user, dept)" class="btn-icon-small btn-danger">✖️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluation Questions Tab -->
      <div v-if="activeTab === 'evaluations'" class="tab-content">
        <!-- Department A Evaluation Questions Section -->
        <div class="evaluation-section">
          <div class="section-header">
            <h2>✅ {{ $t('admin.deptAEvaluationTitle') }}</h2>
            <p class="subtitle">{{ $t('admin.deptAEvaluationSubtitle') }}</p>
            <button @click="openQuestionModal()" class="btn-primary">➕ {{ $t('admin.addQuestion') }}</button>
          </div>

          <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
          <div v-else-if="evaluationQuestions.length === 0" class="empty-state">
            <p>{{ $t('admin.noEvaluationQuestions') }}</p>
          </div>
          <div v-else class="questions-list">
            <div v-for="question in evaluationQuestions" :key="question.id" class="question-card">
              <div class="question-header">
                <span class="question-order">#{{ question.order }}</span>
                <span :class="['question-status', question.is_active ? 'active' : 'inactive']">
                  {{ question.is_active ? $t('admin.active') : $t('admin.inactive') }}
                </span>
              </div>
              <div class="question-body">
                <p class="question-text">{{ question.question }}</p>
                <div class="question-meta">
                  <span class="format-badge">{{ $t('admin.appliedNotApplied') }}</span>
                  <span class="question-date">{{ $t('common.created') }}: {{ formatDate(question.created_at) }}</span>
                </div>
              </div>
              <div class="question-actions">
                <button @click="openQuestionModal(question)" class="btn-icon">✏️ {{ $t('common.edit') }}</button>
                <button
                  @click="toggleQuestionStatus(question)"
                  class="btn-icon"
                  :title="question.is_active ? $t('common.deactivate') : $t('common.activate')"
                >
                  {{ question.is_active ? '⏸️' : '▶️' }}
                </button>
                <button @click="deleteQuestion(question)" class="btn-icon btn-danger">🗑️ {{ $t('common.delete') }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Path Evaluation Questions Section -->
        <div class="evaluation-section" style="margin-top: 3rem;">
          <div class="section-header">
            <h2>✅ {{ $t('admin.pathEvaluationTitle') }}</h2>
            <p class="subtitle">{{ $t('admin.pathEvaluationSubtitle') }}</p>
            <button @click="openPathQuestionModal()" class="btn-primary">➕ {{ $t('admin.addPathQuestion') }}</button>
          </div>

          <div v-if="isLoadingPathQuestions" class="loading">{{ $t('admin.loadingPathQuestions') }}</div>
          <div v-else-if="groupedPathQuestions.length === 0" class="empty-state">
            <p>{{ $t('admin.noPathQuestions') }}</p>
          </div>
          <div v-else>
            <div v-for="group in groupedPathQuestions" :key="group.pathId" class="path-questions-group">
              <h3 class="path-title">
                <span class="path-icon">🔀</span>
                {{ group.pathName }}
                <span class="badge badge-info">{{ group.questions.length }} questions</span>
              </h3>
              <div class="questions-list">
                <div v-for="question in group.questions" :key="question.id" class="question-card path-question-card">
                  <div class="question-header">
                    <span class="question-order">#{{ question.order }}</span>
                    <span :class="['question-status', question.is_active ? 'active' : 'inactive']">
                      {{ question.is_active ? $t('admin.active') : $t('admin.inactive') }}
                    </span>
                  </div>
                  <div class="question-body">
                    <p class="question-text">{{ question.question }}</p>
                    <div class="question-meta">
                      <span class="format-badge">{{ $t('admin.appliedNotApplied') }}</span>
                      <span class="question-date">{{ $t('common.created') }}: {{ formatDate(question.created_at) }}</span>
                    </div>
                  </div>
                  <div class="question-actions">
                    <button @click="openPathQuestionModal(question)" class="btn-icon">✏️ {{ $t('common.edit') }}</button>
                    <button
                      @click="togglePathQuestionStatus(question)"
                      class="btn-icon"
                      :title="question.is_active ? $t('common.deactivate') : $t('common.activate')"
                    >
                      {{ question.is_active ? '⏸️' : '▶️' }}
                    </button>
                    <button @click="deletePathQuestion(question)" class="btn-icon btn-danger">🗑️ {{ $t('common.delete') }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions & Roles Tab -->
      <div v-if="activeTab === 'permissions'" class="tab-content">
        <div class="permissions-container">
          <!-- Roles Section -->
          <div class="permissions-section">
            <div class="section-header">
              <h2>{{ $t('admin.roles') }} ({{ roles.length }})</h2>
              <button @click="openRoleModal()" class="btn-primary">➕ {{ $t('admin.createRole') }}</button>
            </div>
            <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
            <div v-else class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ $t('admin.roleName') }}</th>
                    <th>{{ $t('admin.permissions') }}</th>
                    <th>{{ $t('admin.users') }}</th>
                    <th>{{ $t('admin.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="role in roles" :key="role.id">
                    <td><strong>{{ role.name }}</strong></td>
                    <td>
                      <span class="badge badge-info">{{ role.permissions?.length || 0 }} {{ $t('admin.permissions').toLowerCase() }}</span>
                    </td>
                    <td>{{ role.users_count || 0 }}</td>
                    <td class="actions">
                      <button @click="openRoleModal(role)" class="btn-icon" :title="$t('admin.editRole')">✏️</button>
                      <button @click="deleteRole(role)" class="btn-icon btn-danger" :disabled="['Super Admin', 'Admin'].includes(role.name)" :title="$t('admin.deleteRole')">🗑️</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- User Role Assignment Section -->
          <div class="permissions-section">
            <div class="section-header">
              <h2>{{ $t('admin.userRoleAssignments') }}</h2>
              <button @click="openUserRoleModal()" class="btn-primary">🔗 {{ $t('admin.assignRole') }}</button>
            </div>
            <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
            <div v-else class="user-roles-grid">
              <div v-for="user in users" :key="user.id" class="user-role-card">
                <div class="user-role-header">
                  <div>
                    <strong>{{ user.name }}</strong>
                    <div><code>{{ user.email }}</code></div>
                  </div>
                </div>
                <div class="user-role-body">
                  <div class="role-badges">
                    <span v-if="user.roles && user.roles.length > 0">
                      <span v-for="role in user.roles" :key="role.id" class="badge badge-primary">{{ role.name }}</span>
                    </span>
                    <span v-else class="text-muted">{{ $t('admin.noRolesAssigned') }}</span>
                  </div>
                  <button @click="openUserRoleModal(user)" class="btn-icon-small">🔄 {{ $t('admin.change') }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Permission Matrix Section -->
          <div class="permissions-section">
            <div class="section-header">
              <h2>{{ $t('admin.permissionMatrix') }}</h2>
            </div>
            <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
            <div v-else class="permissions-matrix">
              <div v-for="(perms, category) in groupedPermissions" :key="category" class="permission-category">
                <h3 class="category-title">{{ category }}</h3>
                <div class="permission-list">
                  <div v-for="perm in perms" :key="perm.id" class="permission-item">
                    <span class="permission-name">{{ perm.name }}</span>
                    <span class="badge badge-info">{{ getRolesForPermission(perm.id).length }} roles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Idea Types Tab -->
      <div v-if="activeTab === 'ideaTypes'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.ideaTypes') }} ({{ ideaTypes.length }})</h2>
          <button @click="openIdeaTypeModal()" class="btn-primary">➕ {{ $t('admin.addIdeaType') }}</button>
        </div>
        <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ $t('admin.order') }}</th>
                <th>{{ $t('admin.name') }}</th>
                <th>{{ $t('admin.description') }}</th>
                <th>{{ $t('admin.color') }}</th>
                <th>{{ $t('admin.status') }}</th>
                <th>{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ideaType in ideaTypes" :key="ideaType.id">
                <td><span class="badge badge-info">#{{ ideaType.order }}</span></td>
                <td>
                  <strong>{{ ideaType.name }}</strong><br>
                  <small class="text-muted">{{ ideaType.name_ar }}</small>
                </td>
                <td>
                  <div v-if="ideaType.description">{{ ideaType.description.substring(0, 50) }}{{ ideaType.description.length > 50 ? '...' : '' }}</div>
                  <div v-else class="text-muted">-</div>
                </td>
                <td>
                  <div class="color-preview" :style="{ backgroundColor: ideaType.color }">
                    <code>{{ ideaType.color }}</code>
                  </div>
                </td>
                <td>
                  <span :class="['badge', ideaType.is_active ? 'badge-success' : 'badge-inactive']">
                    {{ ideaType.is_active ? $t('admin.active') : $t('admin.inactive') }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="openIdeaTypeModal(ideaType)" class="btn-icon" :title="$t('common.edit')">✏️</button>
                  <button @click="toggleIdeaTypeStatus(ideaType)" class="btn-icon" :title="ideaType.is_active ? $t('admin.deactivate') : $t('admin.activate')">
                    {{ ideaType.is_active ? '⏸️' : '▶️' }}
                  </button>
                  <button @click="deleteIdeaType(ideaType)" class="btn-icon btn-danger" :title="$t('common.delete')">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Workflow Paths Tab -->
      <div v-if="activeTab === 'workflowPaths'" class="tab-content">
        <div class="section-header">
          <h2>{{ $t('admin.workflowPaths') }} ({{ workflowPaths.length }})</h2>
          <button @click="openPathModal()" class="btn-primary">➕ {{ $t('admin.addWorkflowPath') }}</button>
        </div>
        <div v-if="isLoading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ $t('admin.pathName') }}</th>
                <th>{{ $t('admin.pathCode') }}</th>
                <th>{{ $t('admin.pathDescription') }}</th>
                <th>{{ $t('admin.pathOrder') }}</th>
                <th>{{ $t('admin.status') }}</th>
                <th>{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="path in workflowPaths" :key="path.id">
                <td><strong>{{ path.name }}</strong></td>
                <td><code>{{ path.code }}</code></td>
                <td>
                  <div v-if="path.description">{{ path.description.substring(0, 50) }}{{ path.description.length > 50 ? '...' : '' }}</div>
                  <div v-else class="text-muted">-</div>
                </td>
                <td><span class="badge badge-info">#{{ path.order || 0 }}</span></td>
                <td>
                  <span :class="['badge', path.is_active ? 'badge-success' : 'badge-inactive']">
                    {{ path.is_active ? $t('admin.active') : $t('admin.inactive') }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="openPathModal(path)" class="btn-icon">✏️</button>
                  <button @click="deletePath(path)" class="btn-icon btn-danger">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="workflowPaths.length === 0" class="empty-state">
            <p>{{ $t('admin.noPathsFound') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Modal -->
    <div v-if="questionModal.show" class="modal-overlay" @click="closeQuestionModal">
      <div class="modal-content" @click.stop>
        <h2>{{ questionModal.isEdit ? $t('common.edit') : $t('common.save') }} {{ $t('admin.evaluationQuestion') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.question') }} {{ $t('admin.required') }}</label>
          <textarea v-model="questionModal.form.question" rows="3" required :placeholder="$t('admin.enterQuestionPlaceholder')"></textarea>
          <small>{{ $t('admin.deptAWillAnswer') }}</small>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.displayOrder') }}</label>
          <input v-model.number="questionModal.form.order" type="number" min="0" />
        </div>
        <div class="form-group">
          <label><input v-model="questionModal.form.is_active" type="checkbox" /> {{ $t('admin.active') }}</label>
        </div>
        <div class="modal-actions">
          <button @click="closeQuestionModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveQuestion" :disabled="questionModal.isLoading" class="btn-primary">
            {{ questionModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Path Question Modal -->
    <div v-if="pathQuestionModal.show" class="modal-overlay" @click="closePathQuestionModal">
      <div class="modal-content" @click.stop>
        <h2>{{ pathQuestionModal.isEdit ? $t('admin.editPathQuestion') : $t('admin.addPathQuestion') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.workflowPath') }} {{ $t('admin.required') }}</label>
          <select v-model="pathQuestionModal.form.workflow_path_id" required :disabled="pathQuestionModal.isEdit">
            <option value="">{{ $t('admin.selectWorkflowPath') }}</option>
            <option v-for="path in workflowPaths" :key="path.id" :value="path.id">
              {{ path.name }}
            </option>
          </select>
          <small v-if="pathQuestionModal.isEdit">{{ $t('admin.pathCannotChangeAfterCreation') }}</small>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.question') }} {{ $t('admin.required') }}</label>
          <textarea v-model="pathQuestionModal.form.question" rows="3" required :placeholder="$t('admin.enterQuestionPlaceholder')"></textarea>
          <small>{{ $t('admin.deptManagersWillAnswer') }}</small>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.displayOrder') }}</label>
          <input v-model.number="pathQuestionModal.form.order" type="number" min="0" />
        </div>
        <div class="form-group">
          <label><input v-model="pathQuestionModal.form.is_active" type="checkbox" /> {{ $t('admin.active') }}</label>
        </div>
        <div class="modal-actions">
          <button @click="closePathQuestionModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="savePathQuestion" :disabled="pathQuestionModal.isLoading" class="btn-primary">
            {{ pathQuestionModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="departmentModal.show" class="modal-overlay" @click="closeDepartmentModal">
      <div class="modal-content" @click.stop>
        <h2>{{ departmentModal.isEdit ? $t('common.edit') : $t('common.save') }} {{ $t('admin.department') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.name') }} {{ $t('admin.required') }}</label>
          <input v-model="departmentModal.form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.code') }} {{ $t('admin.required') }}</label>
          <input v-model="departmentModal.form.code" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.description') }}</label>
          <textarea v-model="departmentModal.form.description" rows="3"></textarea>
        </div>
        <div class="form-group-inline">
          <label><input v-model="departmentModal.form.is_active" type="checkbox" /> {{ $t('admin.active') }}</label>
          <label><input v-model="departmentModal.form.is_department_a" type="checkbox" /> {{ $t('admin.isDepartmentA') }}</label>
        </div>
        <div class="modal-actions">
          <button @click="closeDepartmentModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveDepartment" :disabled="departmentModal.isLoading" class="btn-primary">
            {{ departmentModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="userModal.show" class="modal-overlay" @click="closeUserModal">
      <div class="modal-content" @click.stop>
        <h2>{{ userModal.isEdit ? $t('common.edit') : $t('common.save') }} {{ $t('admin.user') }}</h2>

        <!-- External User Lookup (if configured) -->
        <div v-if="!userModal.isEdit && externalUserLookup.configured" class="form-group external-user-lookup">
          <label>🔍 {{ $t('admin.searchExternalUser') }} <span class="optional">{{ $t('admin.optional') }}</span></label>
          <div class="autocomplete-wrapper">
            <input
              :value="externalUserLookup.searchQuery"
              @input="onExternalUserSearchInput"
              type="text"
              :placeholder="$t('admin.typeToSearch')"
              class="autocomplete-input"
            />
            <div v-if="externalUserLookup.isSearching" class="autocomplete-loading">
              <div class="spinner-small"></div>
            </div>
            <div v-if="externalUserLookup.showDropdown && externalUserLookup.searchResults.length > 0" class="autocomplete-dropdown">
              <div
                v-for="user in externalUserLookup.searchResults"
                :key="user.id || user.number"
                @click="selectExternalUser(user)"
                class="autocomplete-item"
              >
                <div class="autocomplete-item-name">{{ user.name || user.full_name || 'N/A' }}</div>
                <div class="autocomplete-item-details">{{ user.email || user.id || user.number }}</div>
              </div>
            </div>
            <div v-if="externalUserLookup.showDropdown && !externalUserLookup.isSearching && externalUserLookup.searchResults.length === 0 && externalUserLookup.searchQuery" class="autocomplete-empty">
              {{ $t('admin.noUsersFound') }}
            </div>
          </div>
          <small class="form-hint">{{ $t('admin.searchHint') }}</small>
        </div>

        <div v-if="!userModal.isEdit && externalUserLookup.configured" class="form-group">
          <label>{{ $t('admin.externalUserNumber') }}</label>
          <input v-model="userModal.form.external_user_number" type="text" readonly disabled />
        </div>

        <div class="form-group">
          <label>{{ $t('admin.name') }} {{ $t('admin.required') }}</label>
          <input v-model="userModal.form.name" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.email') }} {{ $t('admin.required') }}</label>
          <input v-model="userModal.form.email" type="email" required />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.password') }} {{ userModal.isEdit ? $t('admin.passwordLeaveBlank') : $t('admin.required') }}</label>
          <input v-model="userModal.form.password" type="password" :required="!userModal.isEdit" />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.role') }} {{ $t('admin.required') }}</label>
          <select v-model="userModal.form.role" required>
            <option value="admin">{{ $t('admin.admin') }}</option>
            <option value="manager">{{ $t('admin.manager') }}</option>
            <option value="employee">{{ $t('admin.employee') }}</option>
            <option value="user">{{ $t('admin.user') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label><input v-model="userModal.form.is_active" type="checkbox" /> {{ $t('admin.active') }}</label>
        </div>
        <div class="modal-actions">
          <button @click="closeUserModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveUser" :disabled="userModal.isLoading" class="btn-primary">
            {{ userModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="assignmentModal.show" class="modal-overlay" @click="closeAssignmentModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('admin.assignUserToDepartment') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.user') }} {{ $t('admin.required') }}</label>
          <select v-model="assignmentModal.form.user_id" required>
            <option value="">{{ $t('admin.selectUser') }}</option>
            <option v-for="user in users.filter(u => ['manager', 'employee'].includes(u.role))" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.department') }} {{ $t('admin.required') }}</label>
          <select v-model="assignmentModal.form.department_id" required>
            <option value="">{{ $t('admin.selectDepartment') }}</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.role') }} {{ $t('admin.required') }}</label>
          <select v-model="assignmentModal.form.role" required>
            <option value="manager">{{ $t('admin.manager') }}</option>
            <option value="employee">{{ $t('admin.employee') }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="closeAssignmentModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveAssignment" :disabled="assignmentModal.isLoading" class="btn-primary">
            {{ assignmentModal.isLoading ? $t('common.submitting') : $t('common.submit') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="editRoleModal.show" class="modal-overlay" @click="closeEditRoleModal">
      <div class="modal-content" @click.stop>
        <h2>{{ $t('admin.changeUserRole') }}</h2>
        <p class="modal-subtitle">
          <strong>{{ $t('admin.user') }}:</strong> {{ editRoleModal.user?.name }}<br />
          <strong>{{ $t('admin.department') }}:</strong> {{ editRoleModal.department?.name }}
        </p>
        <div class="form-group">
          <label>{{ $t('admin.newRole') }} {{ $t('admin.required') }}</label>
          <select v-model="editRoleModal.newRole" required>
            <option value="manager">{{ $t('admin.manager') }}</option>
            <option value="employee">{{ $t('admin.employee') }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="closeEditRoleModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="updateUserRole" :disabled="editRoleModal.isLoading" class="btn-primary">
            {{ editRoleModal.isLoading ? $t('common.saving') : $t('admin.change') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <div v-if="roleModal.show" class="modal-overlay" @click="closeRoleModal">
      <div class="modal-content modal-large" @click.stop>
        <h2>{{ roleModal.isEdit ? $t('admin.editRole') : $t('admin.createRole') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.roleName') }} {{ $t('admin.required') }}</label>
          <input v-model="roleModal.form.name" type="text" required :placeholder="$t('admin.roleNamePlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.permissions') }}</label>
          <div class="permissions-checklist">
            <div v-for="(perms, category) in groupedPermissions" :key="category" class="permission-group">
              <h4 class="permission-group-title">{{ category }}</h4>
              <div class="permission-checkboxes">
                <label v-for="perm in perms" :key="perm.id" class="checkbox-label">
                  <input type="checkbox" :value="perm.name" v-model="roleModal.form.permissions" />
                  <span>{{ perm.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeRoleModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveRole" :disabled="roleModal.isLoading" class="btn-primary">
            {{ roleModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- User Role Assignment Modal -->
    <div v-if="userRoleModal.show" class="modal-overlay" @click="closeUserRoleModal">
      <div class="modal-content" @click.stop>
        <h2>{{ userRoleModal.user ? $t('admin.changeUserRole') : $t('admin.assignRole') }}</h2>
        <div v-if="userRoleModal.user" class="modal-subtitle">
          <strong>{{ $t('admin.user') }}:</strong> {{ userRoleModal.user.name }} ({{ userRoleModal.user.email }})
        </div>
        <div class="form-group" v-if="!userRoleModal.user">
          <label>{{ $t('admin.user') }} {{ $t('admin.required') }}</label>
          <select v-model="userRoleModal.form.user_id" required>
            <option value="">{{ $t('admin.selectUser') }}</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.role') }} {{ $t('admin.required') }}</label>
          <select v-model="userRoleModal.form.role_name" required>
            <option value="">{{ $t('admin.selectRole') }}</option>
            <option v-for="role in roles" :key="role.id" :value="role.name">
              {{ role.name }}
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="closeUserRoleModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveUserRole" :disabled="userRoleModal.isLoading" class="btn-primary">
            {{ userRoleModal.isLoading ? $t('common.saving') : $t('common.submit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Idea Type Modal -->
    <div v-if="ideaTypeModal.show" class="modal-overlay" @click="closeIdeaTypeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ ideaTypeModal.isEdit ? $t('common.edit') : $t('common.add') }} {{ $t('admin.ideaType') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.name') }} (English) {{ $t('admin.required') }}</label>
          <input v-model="ideaTypeModal.form.name" type="text" required :placeholder="$t('admin.ideaTypeNamePlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.name') }} ({{ $t('admin.arabic') }}) {{ $t('admin.required') }}</label>
          <input v-model="ideaTypeModal.form.name_ar" type="text" required :placeholder="$t('admin.ideaTypeNameArPlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.description') }} (English)</label>
          <textarea v-model="ideaTypeModal.form.description" rows="3" :placeholder="$t('admin.ideaTypeDescriptionPlaceholder')"></textarea>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.description') }} ({{ $t('admin.arabic') }})</label>
          <textarea v-model="ideaTypeModal.form.description_ar" rows="3" :placeholder="$t('admin.ideaTypeDescriptionArPlaceholder')"></textarea>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.color') }} {{ $t('admin.required') }}</label>
          <div class="color-input-group">
            <input v-model="ideaTypeModal.form.color" type="color" class="color-picker" />
            <input v-model="ideaTypeModal.form.color" type="text" class="color-text" pattern="^#[0-9A-Fa-f]{6}$" :placeholder="$t('admin.colorPlaceholder')" />
          </div>
          <small class="form-hint">{{ $t('admin.colorHint') }}</small>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.displayOrder') }}</label>
          <input v-model.number="ideaTypeModal.form.order" type="number" min="0" />
        </div>
        <div class="form-group">
          <label><input v-model="ideaTypeModal.form.is_active" type="checkbox" /> {{ $t('admin.active') }}</label>
        </div>
        <div class="modal-actions">
          <button @click="closeIdeaTypeModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveIdeaType" :disabled="ideaTypeModal.isLoading" class="btn-primary">
            {{ ideaTypeModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Workflow Path Modal -->
    <div v-if="pathModal.show" class="modal-overlay" @click="closePathModal">
      <div class="modal-content" @click.stop>
        <h2>{{ pathModal.isEdit ? $t('admin.editWorkflowPath') : $t('admin.addWorkflowPath') }}</h2>
        <div class="form-group">
          <label>{{ $t('admin.pathName') }} {{ $t('admin.required') }}</label>
          <input v-model="pathModal.form.name" type="text" required :placeholder="$t('admin.pathNamePlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ $t('admin.pathCode') }} {{ $t('admin.required') }}</label>
          <input v-model="pathModal.form.code" type="text" required :placeholder="$t('admin.pathCodePlaceholder')" :disabled="pathModal.isEdit" />
          <small v-if="pathModal.isEdit">{{ $t('admin.pathCannotChange') }}</small>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.pathDescription') }}</label>
          <textarea v-model="pathModal.form.description" rows="3" :placeholder="$t('admin.pathDescriptionPlaceholder')"></textarea>
        </div>
        <div class="form-group">
          <label>{{ $t('admin.pathOrder') }}</label>
          <input v-model.number="pathModal.form.order" type="number" min="0" :placeholder="$t('admin.pathOrderPlaceholder')" />
        </div>
        <div class="form-group">
          <label><input v-model="pathModal.form.is_active" type="checkbox" /> {{ $t('admin.active') }}</label>
        </div>
        <div class="modal-actions">
          <button @click="closePathModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="savePath" :disabled="pathModal.isLoading" class="btn-primary">
            {{ pathModal.isLoading ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import AppLayout from '../components/AppLayout.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const activeTab = ref('departments')
const departments = ref([])
const users = ref([])
const evaluationQuestions = ref([])
const pathEvaluationQuestions = ref([])
const workflowPaths = ref([])
const roles = ref([])
const permissions = ref([])
const ideaTypes = ref([])
const error = ref(null)
const success = ref(null)
const isLoading = ref(true)
const isLoadingPathQuestions = ref(false)

import { API_URL } from '../config/api'

const departmentModal = ref({ show: false, isEdit: false, isLoading: false, form: { name: '', code: '', description: '', is_active: true, is_department_a: false }, editId: null })
const userModal = ref({ show: false, isEdit: false, isLoading: false, form: { name: '', email: '', password: '', role: 'employee', is_active: true, external_user_number: '' }, editId: null })
const externalUserLookup = ref({ isSearching: false, searchResults: [], searchQuery: '', configured: false, showDropdown: false })
const assignmentModal = ref({ show: false, isLoading: false, form: { user_id: '', department_id: '', role: 'employee' } })
const editRoleModal = ref({ show: false, isLoading: false, user: null, department: null, newRole: 'employee' })
const questionModal = ref({ show: false, isEdit: false, isLoading: false, form: { question: '', order: 0, is_active: true }, editId: null })
const pathQuestionModal = ref({ show: false, isEdit: false, isLoading: false, form: { workflow_path_id: '', question: '', order: 0, is_active: true }, editId: null })
const roleModal = ref({ show: false, isEdit: false, isLoading: false, form: { name: '', permissions: [] }, editId: null })
const userRoleModal = ref({ show: false, isLoading: false, user: null, form: { user_id: '', role_name: '' } })
const ideaTypeModal = ref({ show: false, isEdit: false, isLoading: false, form: { name: '', name_ar: '', description: '', description_ar: '', color: '#22c55e', is_active: true, order: 0 }, editId: null })
const pathModal = ref({ show: false, isEdit: false, isLoading: false, form: { name: '', code: '', description: '', order: 0, is_active: true }, editId: null })

const totalWeight = computed(() => {
  return evaluationQuestions.value
    .filter(q => q.is_active)
    .reduce((sum, q) => sum + parseFloat(q.weight || 0), 0)
})

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

const groupedPermissions = computed(() => {
  const grouped = {}
  permissions.value.forEach(perm => {
    const category = perm.name.split('.')[0]
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1) + ' Permissions'
    if (!grouped[categoryName]) {
      grouped[categoryName] = []
    }
    grouped[categoryName].push(perm)
  })
  return grouped
})

const getRolesForPermission = (permissionId) => {
  return roles.value.filter(role =>
    role.permissions && role.permissions.some(p => p.id === permissionId)
  )
}

onMounted(async () => {
  if (authStore.user?.role !== 'admin') {
    error.value = t('messages.error.accessDenied')
    setTimeout(() => router.push('/dashboard'), 2000)
    return
  }
  await loadData()
})

const loadData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const [deptsRes, usersRes, questionsRes, pathQuestionsRes, pathsRes, rolesRes, permsRes, ideaTypesRes] = await Promise.all([
      axios.get(`${API_URL}/admin/departments`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/admin/evaluation-questions`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/admin/path-evaluation-questions`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/admin/workflow-paths`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/permissions/roles`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/permissions/list`, { headers: { Authorization: `Bearer ${authStore.token}` } }),
      axios.get(`${API_URL}/admin/idea-types`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    ])
    departments.value = deptsRes.data.departments
    users.value = usersRes.data.users
    evaluationQuestions.value = questionsRes.data.questions
    pathEvaluationQuestions.value = pathQuestionsRes.data.questions
    workflowPaths.value = pathsRes.data.paths
    roles.value = rolesRes.data.roles
    permissions.value = permsRes.data.permissions
    ideaTypes.value = ideaTypesRes.data.ideaTypes
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

const refresh = async () => {
  await loadData()
  success.value = t('messages.success.refreshed')
  setTimeout(() => (success.value = null), 3000)
}

const goBack = () => router.push('/dashboard')

const openDepartmentModal = (dept = null) => {
  departmentModal.value = dept ? {
    show: true, isEdit: true, isLoading: false,
    form: { name: dept.name, code: dept.code, description: dept.description || '', is_active: dept.is_active, is_department_a: dept.is_department_a || false },
    editId: dept.id
  } : {
    show: true, isEdit: false, isLoading: false,
    form: { name: '', code: '', description: '', is_active: true, is_department_a: false },
    editId: null
  }
}

const closeDepartmentModal = () => { departmentModal.value.show = false }

const saveDepartment = async () => {
  try {
    departmentModal.value.isLoading = true
    error.value = null
    const url = departmentModal.value.isEdit ? `${API_URL}/admin/departments/${departmentModal.value.editId}` : `${API_URL}/admin/departments`
    const method = departmentModal.value.isEdit ? 'put' : 'post'

    console.log('Saving department:', { url, method, data: departmentModal.value.form })

    await axios[method](url, departmentModal.value.form, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    success.value = departmentModal.value.isEdit ? t('messages.success.departmentUpdated') : t('messages.success.departmentCreated')
    closeDepartmentModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    console.error('Department save error:', err)
    console.error('Error response:', err.response)
    error.value = err.response?.data?.message || err.message || 'Failed to save department'
  } finally {
    departmentModal.value.isLoading = false
  }
}

const deleteDepartment = async (dept) => {
  if (!confirm(`Delete ${dept.name}?`)) return
  try {
    await axios.delete(`${API_URL}/admin/departments/${dept.id}`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    success.value = t('messages.success.departmentDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete'
  }
}

// External User Lookup Functions
let searchTimeout = null

const checkExternalUserLookupConfig = async () => {
  try {
    const res = await axios.get(`${API_URL}/admin/external-user-lookup-config`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    externalUserLookup.value.configured = res.data.configured
  } catch (err) {
    console.error('Failed to check external user lookup config:', err)
  }
}

const searchExternalUsers = async (query) => {
  if (!query || query.length < 1) {
    externalUserLookup.value.searchResults = []
    externalUserLookup.value.showDropdown = false
    return
  }

  try {
    externalUserLookup.value.isSearching = true
    externalUserLookup.value.showDropdown = true
    const res = await axios.get(`${API_URL}/admin/lookup-external-user`, {
      params: { search: query },
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    externalUserLookup.value.searchResults = res.data.users || []
  } catch (err) {
    console.error('Failed to search external users:', err)
    externalUserLookup.value.searchResults = []
  } finally {
    externalUserLookup.value.isSearching = false
  }
}

const onExternalUserSearchInput = (event) => {
  const query = event.target.value
  externalUserLookup.value.searchQuery = query

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Debounce search by 500ms
  searchTimeout = setTimeout(() => {
    searchExternalUsers(query)
  }, 500)
}

const selectExternalUser = (user) => {
  // Assuming the external API returns user objects with 'id', 'name', 'email', etc.
  // Adjust these fields based on your actual API response structure
  userModal.value.form.external_user_number = user.id || user.number || user.user_id || ''
  if (user.name) userModal.value.form.name = user.name
  if (user.email) userModal.value.form.email = user.email

  externalUserLookup.value.showDropdown = false
  externalUserLookup.value.searchQuery = user.name || user.id || ''
}

const openUserModal = async (user = null) => {
  userModal.value = user ? {
    show: true, isEdit: true, isLoading: false,
    form: { name: user.name, email: user.email, password: '', role: user.role, is_active: user.is_active, external_user_number: user.external_user_number || '' },
    editId: user.id
  } : {
    show: true, isEdit: false, isLoading: false,
    form: { name: '', email: '', password: '', role: 'employee', is_active: true, external_user_number: '' },
    editId: null
  }

  // Reset external user lookup state
  externalUserLookup.value = { isSearching: false, searchResults: [], searchQuery: '', configured: false, showDropdown: false }

  // Check if external user lookup is configured
  await checkExternalUserLookupConfig()
}

const closeUserModal = () => { userModal.value.show = false }

const saveUser = async () => {
  try {
    userModal.value.isLoading = true
    error.value = null
    const url = userModal.value.isEdit ? `${API_URL}/admin/users/${userModal.value.editId}` : `${API_URL}/admin/users`
    const method = userModal.value.isEdit ? 'put' : 'post'
    await axios[method](url, userModal.value.form, { headers: { Authorization: `Bearer ${authStore.token}` } })
    success.value = userModal.value.isEdit ? t('messages.success.userUpdated') : t('messages.success.userCreated')
    closeUserModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save user'
  } finally {
    userModal.value.isLoading = false
  }
}

const deleteUser = async (user) => {
  if (user.id === authStore.user?.id) {
    error.value = t('messages.error.cannotDeleteOwnAccount')
    return
  }
  if (!confirm(`Delete ${user.name}?`)) return
  try {
    await axios.delete(`${API_URL}/admin/users/${user.id}`, { headers: { Authorization: `Bearer ${authStore.token}` } })
    success.value = t('messages.success.userDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete'
  }
}

const openAssignmentModal = () => {
  assignmentModal.value = { show: true, isLoading: false, form: { user_id: '', department_id: '', role: 'employee' } }
}

const closeAssignmentModal = () => { assignmentModal.value.show = false }

const saveAssignment = async () => {
  try {
    assignmentModal.value.isLoading = true
    error.value = null
    await axios.post(`${API_URL}/admin/assign-user-department`, assignmentModal.value.form, { headers: { Authorization: `Bearer ${authStore.token}` } })
    success.value = t('messages.success.userAssigned')
    closeAssignmentModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to assign'
  } finally {
    assignmentModal.value.isLoading = false
  }
}

const openEditRoleModal = (user, dept) => {
  editRoleModal.value = { show: true, isLoading: false, user, department: dept, newRole: user.pivot.role }
}

const closeEditRoleModal = () => { editRoleModal.value.show = false }

const updateUserRole = async () => {
  try {
    editRoleModal.value.isLoading = true
    error.value = null
    await axios.put(`${API_URL}/admin/update-user-department-role`, {
      user_id: editRoleModal.value.user.id,
      department_id: editRoleModal.value.department.id,
      role: editRoleModal.value.newRole
    }, { headers: { Authorization: `Bearer ${authStore.token}` } })
    success.value = t('messages.success.roleUpdated')
    closeEditRoleModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update'
  } finally {
    editRoleModal.value.isLoading = false
  }
}

const removeUserFromDept = async (user, dept) => {
  if (!confirm(`Remove ${user.name} from ${dept.name}?`)) return
  try {
    error.value = null
    await axios.post(`${API_URL}/admin/remove-user-department`, {
      user_id: user.id,
      department_id: dept.id
    }, { headers: { Authorization: `Bearer ${authStore.token}` } })
    success.value = t('messages.success.userRemoved')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to remove'
  }
}

// ===== EVALUATION QUESTIONS =====
const openQuestionModal = (question = null) => {
  if (question) {
    questionModal.value = {
      show: true,
      isEdit: true,
      isLoading: false,
      form: {
        question: question.question,
        order: question.order,
        is_active: question.is_active
      },
      editId: question.id
    }
  } else {
    questionModal.value = {
      show: true,
      isEdit: false,
      isLoading: false,
      form: { question: '', order: evaluationQuestions.value.length, is_active: true },
      editId: null
    }
  }
}

const closeQuestionModal = () => {
  questionModal.value = { show: false, isEdit: false, isLoading: false, form: { question: '', order: 0, is_active: true }, editId: null }
}

const saveQuestion = async () => {
  try {
    questionModal.value.isLoading = true
    error.value = null

    if (questionModal.value.isEdit) {
      await axios.put(`${API_URL}/admin/evaluation-questions/${questionModal.value.editId}`, questionModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.questionUpdated')
    } else {
      await axios.post(`${API_URL}/admin/evaluation-questions`, questionModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.questionCreated')
    }

    closeQuestionModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save question'
  } finally {
    questionModal.value.isLoading = false
  }
}

const toggleQuestionStatus = async (question) => {
  if (!confirm(`Are you sure you want to ${question.is_active ? 'deactivate' : 'activate'} this question?`)) return

  try {
    await axios.put(`${API_URL}/admin/evaluation-questions/${question.id}`, {
      is_active: !question.is_active
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = `Question ${question.is_active ? 'deactivated' : 'activated'}`
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update question'
  }
}

const deleteQuestion = async (question) => {
  if (!confirm(`Are you sure you want to delete this question? This cannot be undone.`)) return

  try {
    await axios.delete(`${API_URL}/admin/evaluation-questions/${question.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.questionDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete question'
  }
}

// ===== ROLE MANAGEMENT =====
const openRoleModal = (role = null) => {
  if (role) {
    roleModal.value = {
      show: true,
      isEdit: true,
      isLoading: false,
      form: {
        name: role.name,
        permissions: role.permissions ? role.permissions.map(p => p.name) : []
      },
      editId: role.id
    }
  } else {
    roleModal.value = {
      show: true,
      isEdit: false,
      isLoading: false,
      form: { name: '', permissions: [] },
      editId: null
    }
  }
}

const closeRoleModal = () => {
  roleModal.value = { show: false, isEdit: false, isLoading: false, form: { name: '', permissions: [] }, editId: null }
}

const saveRole = async () => {
  try {
    roleModal.value.isLoading = true
    error.value = null

    if (roleModal.value.isEdit) {
      await axios.put(`${API_URL}/permissions/roles/${roleModal.value.editId}`, roleModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.roleUpdated')
    } else {
      await axios.post(`${API_URL}/permissions/roles`, roleModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.roleCreated')
    }

    closeRoleModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save role'
  } finally {
    roleModal.value.isLoading = false
  }
}

const deleteRole = async (role) => {
  if (['Super Admin', 'Admin'].includes(role.name)) {
    error.value = t('messages.error.cannotDeleteSystemRoles')
    setTimeout(() => (error.value = null), 5000)
    return
  }

  if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return

  try {
    await axios.delete(`${API_URL}/permissions/roles/${role.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.roleDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete role'
  }
}

// ===== USER ROLE ASSIGNMENT =====
const openUserRoleModal = (user = null) => {
  if (user) {
    userRoleModal.value = {
      show: true,
      isLoading: false,
      user: user,
      form: {
        user_id: user.id,
        role_name: user.roles && user.roles.length > 0 ? user.roles[0].name : ''
      }
    }
  } else {
    userRoleModal.value = {
      show: true,
      isLoading: false,
      user: null,
      form: { user_id: '', role_name: '' }
    }
  }
}

const closeUserRoleModal = () => {
  userRoleModal.value = { show: false, isLoading: false, user: null, form: { user_id: '', role_name: '' } }
}

const saveUserRole = async () => {
  try {
    userRoleModal.value.isLoading = true
    error.value = null

    const userId = userRoleModal.value.user ? userRoleModal.value.user.id : userRoleModal.value.form.user_id

    await axios.post(`${API_URL}/permissions/assign-role`, {
      user_id: userId,
      role_name: userRoleModal.value.form.role_name
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    success.value = t('messages.success.roleAssigned')
    closeUserRoleModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to assign role'
  } finally {
    userRoleModal.value.isLoading = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Path Evaluation Question Functions
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
    success.value = t('messages.success.pathQuestionDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete'
  }
}

// ===== IDEA TYPES MANAGEMENT =====
const openIdeaTypeModal = (ideaType = null) => {
  if (ideaType) {
    ideaTypeModal.value = {
      show: true,
      isEdit: true,
      isLoading: false,
      form: {
        name: ideaType.name,
        name_ar: ideaType.name_ar,
        description: ideaType.description || '',
        description_ar: ideaType.description_ar || '',
        color: ideaType.color,
        is_active: ideaType.is_active,
        order: ideaType.order
      },
      editId: ideaType.id
    }
  } else {
    ideaTypeModal.value = {
      show: true,
      isEdit: false,
      isLoading: false,
      form: {
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        color: '#22c55e',
        is_active: true,
        order: ideaTypes.value.length
      },
      editId: null
    }
  }
}

const closeIdeaTypeModal = () => {
  ideaTypeModal.value = {
    show: false,
    isEdit: false,
    isLoading: false,
    form: {
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      color: '#22c55e',
      is_active: true,
      order: 0
    },
    editId: null
  }
}

const saveIdeaType = async () => {
  try {
    ideaTypeModal.value.isLoading = true
    error.value = null

    if (ideaTypeModal.value.isEdit) {
      await axios.put(`${API_URL}/admin/idea-types/${ideaTypeModal.value.editId}`, ideaTypeModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.ideaTypeUpdated')
    } else {
      await axios.post(`${API_URL}/admin/idea-types`, ideaTypeModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.ideaTypeCreated')
    }

    closeIdeaTypeModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save idea type'
  } finally {
    ideaTypeModal.value.isLoading = false
  }
}

const toggleIdeaTypeStatus = async (ideaType) => {
  if (!confirm(`Are you sure you want to ${ideaType.is_active ? 'deactivate' : 'activate'} this idea type?`)) return

  try {
    await axios.post(`${API_URL}/admin/idea-types/${ideaType.id}/toggle-status`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = `Idea type ${ideaType.is_active ? 'deactivated' : 'activated'}`
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update idea type'
  }
}

const deleteIdeaType = async (ideaType) => {
  if (!confirm(`Are you sure you want to delete "${ideaType.name}"? This cannot be undone.`)) return

  try {
    await axios.delete(`${API_URL}/admin/idea-types/${ideaType.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.ideaTypeDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete idea type'
  }
}

// ============= WORKFLOW PATH MANAGEMENT =============

const openPathModal = (path = null) => {
  if (path) {
    pathModal.value = {
      show: true,
      isEdit: true,
      isLoading: false,
      form: {
        name: path.name,
        code: path.code,
        description: path.description || '',
        order: path.order || 0,
        is_active: path.is_active
      },
      editId: path.id
    }
  } else {
    pathModal.value = {
      show: true,
      isEdit: false,
      isLoading: false,
      form: {
        name: '',
        code: '',
        description: '',
        order: workflowPaths.value.length,
        is_active: true
      },
      editId: null
    }
  }
}

const closePathModal = () => {
  pathModal.value = {
    show: false,
    isEdit: false,
    isLoading: false,
    form: {
      name: '',
      code: '',
      description: '',
      order: 0,
      is_active: true
    },
    editId: null
  }
}

const savePath = async () => {
  try {
    pathModal.value.isLoading = true
    error.value = null

    if (pathModal.value.isEdit) {
      await axios.put(`${API_URL}/admin/workflow-paths/${pathModal.value.editId}`, pathModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.workflowPathUpdated')
    } else {
      await axios.post(`${API_URL}/admin/workflow-paths`, pathModal.value.form, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      success.value = t('messages.success.workflowPathCreated')
    }

    closePathModal()
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save workflow path'
  } finally {
    pathModal.value.isLoading = false
  }
}

const deletePath = async (path) => {
  if (!confirm(`Are you sure you want to delete "${path.name}"? This cannot be undone.`)) return

  try {
    await axios.delete(`${API_URL}/admin/workflow-paths/${path.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    success.value = t('messages.success.workflowPathDeleted')
    await loadData()
    setTimeout(() => (success.value = null), 5000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete workflow path'
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 1400px;
  margin: 0 auto;
  direction: inherit;
}

/* Welcome Section - Green gradient like dashboard */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: linear-gradient(135deg, #084 0%, #66a459 100%);
  border-radius: var(--radius-2xl);
  color: white;
}

.welcome-section h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-2);
  color: white;
}

.welcome-subtitle {
  font-size: var(--font-size-base);
  opacity: 0.95;
  margin: 0;
  color: white;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
.alert { padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
.alert-error { background: #fee; color: #c33; border: 1px solid #fcc; }
.alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #4caf50; }
.tabs { display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
.tab { padding: 12px 24px; background: none; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-size: 15px; font-weight: 500; color: #666; transition: all 0.3s; }
.tab:hover { color: #22c55e; }
.tab.active { color: #22c55e; border-bottom-color: #22c55e; }
.tab-link { text-decoration: none; display: flex; align-items: center; }

/* RTL Support for tabs */
html[dir="rtl"] .tabs {
  direction: rtl;
}

html[dir="rtl"] .tab-link {
  flex-direction: row-reverse;
}

/* RTL Support for welcome section */
html[dir="rtl"] .welcome-section {
  direction: rtl;
  text-align: right;
}

html[dir="rtl"] .welcome-section h1 {
  text-align: right;
}

html[dir="rtl"] .welcome-subtitle {
  text-align: right;
}

html[dir="rtl"] .btn-refresh {
  flex-direction: row-reverse;
}

/* LTR explicit support for welcome section */
html[dir="ltr"] .welcome-section {
  direction: ltr;
  text-align: left;
}

html[dir="ltr"] .welcome-section h1 {
  text-align: left;
}

html[dir="ltr"] .welcome-subtitle {
  text-align: left;
}

.tab-content { animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { color: #333; font-size: 20px; margin: 0; }
.btn-primary { padding: 10px 20px; background: #22c55e; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { background: #16a34a; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.loading { text-align: center; padding: 40px; color: #666; font-size: 16px; }
.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; direction: inherit; }
.data-table thead { background: #f8f9fa; }
.data-table th { padding: 12px; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #dee2e6; }
.data-table td { padding: 12px; border-bottom: 1px solid #e9ecef; }
.data-table tbody tr:hover { background: #f8f9ff; }
.data-table code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

/* RTL Support for tables */
html[dir="rtl"] .data-table th,
html[dir="rtl"] .data-table td {
  text-align: right;
}

/* RTL Support for section header */
html[dir="rtl"] .section-header {
  direction: rtl;
}

/* RTL Support for actions */
html[dir="rtl"] .actions {
  flex-direction: row-reverse;
}

.badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px; }

/* RTL Support for badges */
html[dir="rtl"] .badge {
  margin-left: 0;
  margin-right: 8px;
}
.badge-primary { background: #667eea; color: white; }
.badge-success { background: #4caf50; color: white; }
.badge-inactive { background: #9e9e9e; color: white; }
.badge-admin { background: #ff6b6b; color: white; }
.badge-manager { background: #4ecdc4; color: white; }
.badge-employee { background: #ffd93d; color: #333; }
.badge-user { background: #95e1d3; color: white; }
.badge-dept { background: #e3f2fd; color: #1976d2; margin-right: 4px; }
.badge-info { background: #2196f3; color: white; }
.dept-badges { display: flex; flex-wrap: wrap; gap: 4px; }

/* RTL Support for department badges */
html[dir="rtl"] .dept-badges {
  direction: rtl;
}

html[dir="rtl"] .badge-dept {
  margin-right: 0;
  margin-left: 4px;
}
.text-muted { color: #999; font-style: italic; }
.actions { display: flex; gap: 8px; }
.btn-icon { padding: 6px 10px; background: #f5f5f5; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: all 0.2s; }
.btn-icon:hover { background: #e0e0e0; transform: scale(1.1); }
.btn-icon.btn-danger:hover { background: #ffebee; }
.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
.assignments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.assignment-card { border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; background: white; transition: all 0.3s; }

/* RTL Support for assignment cards */
html[dir="rtl"] .assignment-card {
  direction: rtl;
}
.assignment-card:hover { border-color: #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2); }
.assignment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0; }
.assignment-header h3 { color: #333; font-size: 16px; margin: 0; }
.empty-message { text-align: center; padding: 20px; color: #999; font-style: italic; }
.members-list { display: flex; flex-direction: column; gap: 10px; }
.member-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; transition: background 0.2s; }
.member-item:hover { background: #f0f3ff; }
.member-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.member-info strong { color: #333; font-size: 13px; }
.member-info code { color: #666; font-size: 11px; }
.member-actions { display: flex; gap: 6px; }

/* RTL Support for member items */
html[dir="rtl"] .member-item {
  direction: rtl;
}

html[dir="rtl"] .member-actions {
  flex-direction: row-reverse;
}

.btn-icon-small { padding: 4px 8px; background: #f5f5f5; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
.btn-icon-small:hover { background: #e0e0e0; transform: scale(1.1); }
.btn-icon-small.btn-danger:hover { background: #ffebee; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { background: white; border-radius: 15px; padding: 30px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }

/* RTL Support for modals */
html[dir="rtl"] .modal-content {
  direction: rtl;
  text-align: right;
}
.modal-content h2 { color: #333; margin-bottom: 20px; }
.modal-subtitle { color: #666; font-size: 14px; margin-bottom: 20px; line-height: 1.6; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #555; font-weight: 500; font-size: 14px; }
.form-group input[type="text"], .form-group input[type="email"], .form-group input[type="password"], .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-family: inherit; font-size: 14px; transition: border-color 0.3s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #667eea; }
.form-group textarea { resize: vertical; }
.form-group-inline { display: flex; gap: 20px; margin-bottom: 20px; }
.form-group-inline label { display: flex; align-items: center; gap: 8px; color: #555; font-weight: 500; font-size: 14px; cursor: pointer; }
.form-group-inline input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
.modal-actions { display: flex; gap: 10px; margin-top: 25px; }

/* RTL Support for modal actions */
html[dir="rtl"] .modal-actions {
  flex-direction: row-reverse;
}

.btn-secondary { flex: 1; padding: 12px; background: #f5f5f5; color: #333; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { background: #e0e0e0; }

/* Evaluation Questions Styles */
.weight-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.weight-label {
  color: #666;
  font-weight: 500;
}

.weight-value {
  font-size: 18px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 8px;
}

.weight-value.complete {
  background: #d1e7dd;
  color: #0f5132;
}

.weight-value.incomplete {
  background: #fff3cd;
  color: #856404;
}

.weight-remaining {
  color: #999;
  font-size: 13px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.3s;
}

.question-card:hover {
  border-color: #22c55e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-order {
  background: #22c55e;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.question-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.question-status.active {
  background: #d1e7dd;
  color: #0f5132;
}

.question-status.inactive {
  background: #f8d7da;
  color: #842029;
}

.question-body {
  margin-bottom: 15px;
}

.question-text {
  color: #333;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.question-meta {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* RTL Support for questions */
html[dir="rtl"] .question-card {
  direction: rtl;
}

html[dir="rtl"] .question-header,
html[dir="rtl"] .question-meta,
html[dir="rtl"] .question-actions {
  flex-direction: row-reverse;
}

.weight-badge {
  background: #22c55e;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.question-date {
  color: #999;
  font-size: 12px;
}

.question-actions {
  display: flex;
  gap: 8px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

/* Permissions & Roles Styles */
.permissions-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.permissions-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.user-roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.user-role-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
}

.user-role-card:hover {
  border-color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.user-role-header {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.user-role-header strong {
  font-size: 14px;
  color: #333;
}

.user-role-header code {
  font-size: 12px;
  color: #666;
}

.user-role-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

/* RTL Support for user roles */
html[dir="rtl"] .user-role-card {
  direction: rtl;
}

html[dir="rtl"] .user-role-body {
  flex-direction: row-reverse;
}

.role-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}

.permissions-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.permission-category {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
}

.category-title {
  color: #22c55e;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #22c55e;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background 0.2s;
}

.permission-item:hover {
  background: #e9ecef;
}

.permission-name {
  font-size: 13px;
  color: #333;
  font-family: 'Courier New', monospace;
}

/* RTL Support for permissions */
html[dir="rtl"] .permission-item {
  flex-direction: row-reverse;
}

.modal-large {
  max-width: 800px;
  max-height: 85vh;
}

.permissions-checklist {
  max-height: 400px;
  overflow-y: auto;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
}

.permission-group {
  margin-bottom: 20px;
}

.permission-group:last-child {
  margin-bottom: 0;
}

.permission-group-title {
  color: #22c55e;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #22c55e;
}

.permission-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.checkbox-label:hover {
  background: #e9ecef;
  transform: translateX(3px);
}

/* RTL Support for checkbox labels */
html[dir="rtl"] .checkbox-label {
  flex-direction: row-reverse;
}

html[dir="rtl"] .checkbox-label:hover {
  transform: translateX(-3px);
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label span {
  color: #333;
  font-family: 'Courier New', monospace;
}

/* Path Evaluation Questions Styles */
.evaluation-section {
  margin-bottom: 3rem;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.path-questions-group {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
}

.path-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

/* RTL Support for path questions */
html[dir="rtl"] .path-questions-group {
  direction: rtl;
}

html[dir="rtl"] .path-title {
  flex-direction: row-reverse;
}

.path-icon {
  font-size: 1.5rem;
}

.path-question-card {
  background: #fafafa;
}

.format-badge {
  padding: 0.25rem 0.75rem;
  background: #e7f5ff;
  color: #1971c2;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-style: italic;
}

/* External User Lookup Autocomplete */
.external-user-lookup {
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.external-user-lookup label {
  color: #084;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}

.external-user-lookup .optional {
  color: #666;
  font-weight: 400;
  font-size: 0.85rem;
}

.form-hint {
  display: block;
  margin-top: 6px;
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
}

.autocomplete-wrapper {
  position: relative;
}

.autocomplete-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.autocomplete-input:focus {
  outline: none;
  border-color: #084;
}

.autocomplete-loading {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #084;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 1000;
}

.autocomplete-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover {
  background-color: #f8f9fa;
}

.autocomplete-item-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.autocomplete-item-details {
  font-size: 0.85rem;
  color: #666;
}

.autocomplete-empty {
  padding: 12px;
  text-align: center;
  color: #999;
  font-style: italic;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-top: 4px;
}

/* RTL Support for Autocomplete */
html[dir="rtl"] .autocomplete-loading {
  right: auto;
  left: 12px;
}

html[dir="rtl"] .autocomplete-input {
  padding: 10px 12px 10px 40px;
}

html[dir="rtl"] .autocomplete-item-name,
html[dir="rtl"] .autocomplete-item-details {
  text-align: right;
}

/* Idea Types Styles */
.color-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.color-preview code {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
}

.color-text {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  transition: border-color 0.3s;
}

.color-text:focus {
  outline: none;
  border-color: #667eea;
}

/* RTL Support for color input group */
html[dir="rtl"] .color-input-group {
  flex-direction: row-reverse;
}
</style>
