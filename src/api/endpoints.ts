export const endpoints = {
  ROLES: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}roles`,
  INSTITUTIONS: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institutions`,
  PRIVILEGES: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}privileges`,
  CAT_TOOL: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool`,
  USERS: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users`,
  TRANSLATION_USERS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}institution-users`,
  VALIDATE_CSV: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/validate-import-csv`,
  IMPORT_CSV: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/import-csv`,
  DEPARTMENTS: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}departments`,
  TAGS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tags`,
  CREATE_TAGS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tags/bulk-create`,
  UPDATE_TAGS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tags/bulk-update`,
  EXPORT_CSV: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/export-csv`,
  ARCHIVE_USER: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/archive`,
  DEACTIVATE_USER: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/deactivate`,
  ACTIVATE_USER: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/activate`,
  VENDORS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}vendors`,
  VENDORS_BULK: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}vendors/bulk`,
  VOLUMES: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}volumes`,
  SKILLS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}skills`,
  PRICES: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}prices`,
  EDIT_PRICES: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}prices/bulk`,
  CLASSIFIER_VALUES: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}classifier-values`,
  PROJECTS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}projects`,
  SUB_PROJECTS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}subprojects`,
  MT_ENGINE: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/toggle-mt-engine`,
  TASKS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}workflow/tasks`,
  HISTORY_TASKS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}workflow/history/tasks`,
  ASSIGNMENTS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}assignments`,
  LINK_CAT_TOOL_JOBS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}assignments/link-cat-tool-jobs`,
  CAT_ASSIGNMENTS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/split`,
  PROJECT_TM: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/project-managers-assignable-by-client`,
  PROJECT_CLIENT: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/assignable-clients`,
  TRANSLATION_MEMORIES: `${process.env.REACT_APP_TRANSLATION_MEMORY_API_BASE}tags`,
  IMPORT_TMX: `${process.env.REACT_APP_TRANSLATION_MEMORY_API_BASE}tm/import`,
  EXPORT_TMX: `${process.env.REACT_APP_TRANSLATION_MEMORY_API_BASE}tm/export`,
  TM_STATS: `${process.env.REACT_APP_TRANSLATION_MEMORY_API_BASE}tm/stats`,
  DISCOUNTS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}institution-discounts`,
  CAT_TOOL_JOBS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/jobs`,
  CAT_TOOL_SETUP: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/setup`,
  CAT_TOOL_SPLIT: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/split`,
  CAT_TOOL_MERGE: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/merge`,
  MEDIA_BULK: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}media/bulk`,
  MEDIA_DOWNLOAD: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}media/download`,
  DOWNLOAD_XLIFF: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/download-xliff`,
  DOWNLOAD_TRANSLATED: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}cat-tool/download-translated`,
  TM_KEYS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tm-keys`,
  TM_SUB_PROJECTS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tm-keys/subprojects`,
  UPDATE_TM_KEYS: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tm-keys/sync`,
  TOGGLE_TM_WRITABLE: `${process.env.REACT_APP_TRANSLATION_PROJECT_API_BASE}tm-keys/toggle-writable`,
  AUDIT_LOGS: `${process.env.REACT_APP_AUDIT_LOG_API_BASE}event-records`,
  EXPORT_AUDIT_LOGS: `${process.env.REACT_APP_AUDIT_LOG_API_BASE}event-records/export`,
}

export const authEndpoints = {
  TOKEN: `realms/${process.env.REACT_APP_KEYCLOAK_realm}/protocol/openid-connect/token`,
}
