const clean = (path: string) => path.replace(/^\//, '').replace('/$', '')

const gateway = (path: string) => {
  return (
    process.env.REACT_APP_GATEWAY_BASE?.replace(/\/$/, '') + '/' + clean(path)
  )
}

const authorization = (path: string) => {
  return gateway(`/authorization/api/${clean(path)}`)
}

const translationOrder = (path: string) => {
  return gateway(`/translation-order/api/${clean(path)}`)
}

const translationMemory = (path: string) => {
  return gateway(`/translation-memory/api/v1/${clean(path)}`)
}

const auditLog = (path: string) => {
  return gateway(`/audit-log/api/${clean(path)}`)
}

export const endpoints = {
  ROLES: authorization('roles'),
  INSTITUTIONS: authorization('institutions'),
  PRIVILEGES: authorization('privileges'),
  USERS: authorization('institution-users'),
  VALIDATE_CSV: authorization('institution-users/validate-import-csv'),
  IMPORT_CSV: authorization('institution-users/import-csv'),
  DEPARTMENTS: authorization('departments'),
  EXPORT_CSV: authorization('institution-users/export-csv'),
  ARCHIVE_USER: authorization('institution-users/archive'),
  DEACTIVATE_USER: authorization('institution-users/deactivate'),
  ACTIVATE_USER: authorization('institution-users/activate'),
  PROJECT_TM: authorization(
    'institution-users/project-managers-assignable-by-client'
  ),
  PROJECT_CLIENT: authorization('institution-users/assignable-clients'),

  CAT_TOOL: translationOrder('cat-tool'),
  TRANSLATION_USERS: translationOrder('institution-users'),
  TAGS: translationOrder('tags'),
  CREATE_TAGS: translationOrder('tags/bulk-create'),
  UPDATE_TAGS: translationOrder('tags/bulk-update'),
  VENDORS: translationOrder('vendors'),
  VENDORS_BULK: translationOrder('vendors/bulk'),
  VOLUMES: translationOrder('volumes'),
  SKILLS: translationOrder('skills'),
  PRICES: translationOrder('prices'),
  EDIT_PRICES: translationOrder('prices/bulk'),
  CLASSIFIER_VALUES: translationOrder('classifier-values'),
  PROJECTS: translationOrder('projects'),
  SUB_PROJECTS: translationOrder('subprojects'),
  MT_ENGINE: translationOrder('cat-tool/toggle-mt-engine'),
  TASKS: translationOrder('workflow/tasks'),
  HISTORY_TASKS: translationOrder('workflow/history/tasks'),
  ASSIGNMENTS: translationOrder('assignments'),
  LINK_CAT_TOOL_JOBS: translationOrder('assignments/link-cat-tool-jobs'),
  CAT_ASSIGNMENTS: translationOrder('cat-tool/split'),
  DISCOUNTS: translationOrder('institution-discounts'),
  CAT_TOOL_JOBS: translationOrder('cat-tool/jobs'),
  CAT_TOOL_SETUP: translationOrder('cat-tool/setup'),
  CAT_TOOL_SPLIT: translationOrder('cat-tool/split'),
  CAT_TOOL_MERGE: translationOrder('cat-tool/merge'),
  MEDIA: translationOrder('media'),
  MEDIA_BULK: translationOrder('media/bulk'),
  MEDIA_DOWNLOAD: translationOrder('media/download'),
  DOWNLOAD_XLIFF: translationOrder('cat-tool/download-xliff'),
  DOWNLOAD_TRANSLATED: translationOrder('cat-tool/download-translated'),
  TM_KEYS: translationOrder('tm-keys'),
  TM_SUB_PROJECTS: translationOrder('tm-keys/subprojects'),
  UPDATE_TM_KEYS: translationOrder('tm-keys/sync'),
  TOGGLE_TM_WRITABLE: translationOrder('tm-keys/toggle-writable'),

  TRANSLATION_MEMORIES: translationMemory('tags'),
  IMPORT_TMX: translationMemory('tm/import'),
  EXPORT_TMX: translationMemory('tm/export'),
  TM_STATS: translationMemory('tm/stats'),

  AUDIT_LOGS: auditLog('event-records'),
  EXPORT_AUDIT_LOGS: auditLog('event-records/export'),
}

export const authEndpoints = {
  CONTEXT: gateway('/context'),
  SWITCH_CONTEXT: gateway('/switch-context'),
  LOGIN: gateway('/login'),
  LOGOUT: gateway('/logout'),
}
