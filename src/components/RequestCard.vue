<template>
  <BaseCard class="request-card" :class="{ 'clickable': clickable }" @click="handleClick">
    <!-- Header -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="request-title">{{ request.title }}</h3>
        <span class="request-id">#{{ request.id }}</span>
      </div>
      <div class="header-right">
        <BaseBadge :variant="getStatusVariant(request.status)">
          {{ $t(`status.${request.status}`) }}
        </BaseBadge>
      </div>
    </div>

    <!-- Description -->
    <div class="card-description" v-if="showDescription">
      <p v-if="truncateDescription">{{ truncatedDescription }}</p>
      <p v-else>{{ request.description }}</p>
    </div>

    <!-- Meta Information -->
    <div class="card-meta">
      <!-- Submitter -->
      <div class="meta-item" v-if="showSubmitter && request.user">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
        </svg>
        <span>{{ request.user?.name || $t('common.unknown') }}</span>
      </div>

      <!-- Department -->
      <div class="meta-item" v-if="showDepartment && (request.department || request.current_department)">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
        </svg>
        <span>{{ request.current_department?.name || request.department?.name || $t('common.notAssigned') }}</span>
      </div>

      <!-- Workflow Path -->
      <div class="meta-item" v-if="showWorkflowPath && request.workflow_path">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        <span>{{ request.workflow_path?.name || $t('common.notAssigned') }}</span>
      </div>

      <!-- Submitted Date -->
      <div class="meta-item" v-if="showDate">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
        </svg>
        <span>{{ formatDate(request.submitted_at || request.created_at) }}</span>
      </div>

      <!-- Expected Execution Date -->
      <div class="meta-item expected-date" v-if="showExpectedDate && request.expected_execution_date">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        <span>{{ formatDate(request.expected_execution_date) }}</span>
      </div>

      <!-- Assigned To -->
      <div class="meta-item" v-if="showAssignedTo && request.assigned_user">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
        <span>{{ request.assigned_user?.name || $t('common.notAssigned') }}</span>
      </div>

      <!-- Attachments Count -->
      <div class="meta-item" v-if="showAttachments && request.attachments?.length">
        <svg class="meta-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
        </svg>
        <span>{{ request.attachments.length }} {{ $t('common.files') }}</span>
      </div>
    </div>

    <!-- Latest Comment/Action -->
    <div class="card-comment" v-if="showLatestComment && latestTransition">
      <div class="comment-header">
        <span class="comment-user">{{ latestTransition.actioned_by_user?.name }}</span>
        <BaseBadge size="sm" :variant="getActionVariant(latestTransition.action)">
          {{ $t(`workflow.actions.${latestTransition.action}`) }}
        </BaseBadge>
      </div>
      <p class="comment-text" v-if="latestTransition.comments">{{ latestTransition.comments }}</p>
    </div>

    <!-- Attachments List -->
    <div class="card-attachments" v-if="showAttachmentsList && request.attachments?.length">
      <div class="attachments-header">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
        </svg>
        <span>{{ $t('common.attachments') }}</span>
      </div>
      <div class="attachments-list">
        <a
          v-for="attachment in request.attachments"
          :key="attachment.id"
          :href="getAttachmentUrl(attachment)"
          target="_blank"
          class="attachment-item"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
          </svg>
          {{ attachment.original_name || attachment.file_name }}
        </a>
      </div>
    </div>

    <!-- Extra Content Slot (for evaluation results, progress, etc.) -->
    <div class="card-extra-content" v-if="$slots['extra-content']">
      <slot name="extra-content"></slot>
    </div>

    <!-- Actions Slot -->
    <div class="card-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from './BaseCard.vue'
import BaseBadge from './BaseBadge.vue'
import { BASE_URL } from '../config/api'

const props = defineProps({
  request: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: false
  },
  showDescription: {
    type: Boolean,
    default: true
  },
  truncateDescription: {
    type: Boolean,
    default: false
  },
  descriptionLength: {
    type: Number,
    default: 120
  },
  showSubmitter: {
    type: Boolean,
    default: true
  },
  showDepartment: {
    type: Boolean,
    default: true
  },
  showWorkflowPath: {
    type: Boolean,
    default: false
  },
  showDate: {
    type: Boolean,
    default: true
  },
  showExpectedDate: {
    type: Boolean,
    default: true
  },
  showAssignedTo: {
    type: Boolean,
    default: false
  },
  showAttachments: {
    type: Boolean,
    default: true
  },
  showAttachmentsList: {
    type: Boolean,
    default: false
  },
  showLatestComment: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const { t } = useI18n()

const truncatedDescription = computed(() => {
  if (!props.request.description) return ''
  if (props.request.description.length <= props.descriptionLength) {
    return props.request.description
  }
  return props.request.description.substring(0, props.descriptionLength) + '...'
})

const latestTransition = computed(() => {
  if (!props.request.transitions?.length) return null
  return props.request.transitions[props.request.transitions.length - 1]
})

const getStatusVariant = (status) => {
  const variants = {
    'draft': 'secondary',
    'pending': 'warning',
    'in_review': 'info',
    'in_progress': 'primary',
    'need_more_details': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'completed': 'success',
    'accepted_for_later': 'info',
    'missing_requirement': 'warning'
  }
  return variants[status] || 'secondary'
}

const getActionVariant = (action) => {
  const variants = {
    'submit': 'info',
    'approve': 'success',
    'reject': 'error',
    'reject_idea': 'error',
    'resubmit': 'info',
    'assign': 'primary',
    'assign_path': 'primary',
    'complete': 'success',
    'employee_accept': 'success',
    'employee_reject': 'error',
    'employee_complete': 'success',
    'progress_update': 'info',
    'accept_later': 'warning',
    'activate': 'success'
  }
  return variants[action] || 'secondary'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getAttachmentUrl = (attachment) => {
  return `${BASE_URL}/storage/${attachment.file_path}`
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.request)
  }
}
</script>

<style scoped>
.request-card {
  transition: all var(--transition-normal, 0.2s) ease;
}

.request-card.clickable {
  cursor: pointer;
}

.request-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4, 16px);
  margin-bottom: var(--spacing-4, 16px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 8px);
  flex: 1;
  min-width: 0;
}

.request-title {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #1f2937);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.request-id {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
  flex-shrink: 0;
}

/* Description */
.card-description {
  margin-bottom: var(--spacing-4, 16px);
}

.card-description p {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
  line-height: 1.6;
  margin: 0;
}

/* Meta Information */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3, 12px);
  margin-bottom: var(--spacing-4, 16px);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 8px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
  background: var(--color-surface, #f9fafb);
  padding: var(--spacing-2, 8px) var(--spacing-3, 12px);
  border-radius: var(--radius-md, 8px);
}

.meta-item.expected-date {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.meta-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

/* Latest Comment */
.card-comment {
  background: rgba(251, 191, 36, 0.1);
  border-left: 3px solid #f59e0b;
  padding: var(--spacing-3, 12px);
  border-radius: var(--radius-md, 8px);
  margin-bottom: var(--spacing-4, 16px);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 8px);
  margin-bottom: var(--spacing-2, 8px);
}

.comment-user {
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #1f2937);
}

.comment-text {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
  line-height: 1.5;
}

/* Attachments */
.card-attachments {
  margin-bottom: var(--spacing-4, 16px);
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2, 8px);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #1f2937);
  margin-bottom: var(--spacing-2, 8px);
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2, 8px);
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1, 4px);
  font-size: var(--font-size-xs, 12px);
  color: var(--color-primary-600, #02735E);
  background: var(--color-primary-50, rgba(2, 115, 94, 0.05));
  padding: var(--spacing-1, 4px) var(--spacing-2, 8px);
  border-radius: var(--radius-sm, 4px);
  text-decoration: none;
  transition: all var(--transition-fast, 0.15s);
}

.attachment-item:hover {
  background: var(--color-primary-100, rgba(2, 115, 94, 0.1));
}

/* Extra Content */
.card-extra-content {
  margin-bottom: var(--spacing-4, 16px);
}

/* Actions */
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2, 8px);
  padding-top: var(--spacing-4, 16px);
  border-top: 1px solid var(--color-border, #e5e7eb);
}

/* RTL Support */
html[dir="rtl"] .card-comment {
  border-left: none;
  border-right: 3px solid #f59e0b;
}

/* Responsive */
@media (max-width: 640px) {
  .card-header {
    flex-direction: column;
    gap: var(--spacing-2, 8px);
  }

  .header-left {
    width: 100%;
  }

  .card-meta {
    flex-direction: column;
  }

  .meta-item {
    width: 100%;
  }
}
</style>
