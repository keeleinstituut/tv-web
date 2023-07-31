export const endpoints = {
  ROLES: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}roles`,
  INSTITUTIONS: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institutions`,
  PRIVILEGES: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}privileges`,
  USERS: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users`,
  VALIDATE_CSV: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/validate-import-csv`,
  IMPORT_CSV: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/import-csv`,
  DEPARTMENTS: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}departments`,
  TAGS: `${process.env.REACT_APP_TRANSLATION_ORDER_API_BASE}tags`,
  CREATE_TAGS: `${process.env.REACT_APP_TRANSLATION_ORDER_API_BASE}tags/bulk-create`,
  EXPORT_CSV: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/export-csv`,
  ARCHIVE_USER: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/archive`,
  DEACTIVATE_USER: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/deactivate`,
  ACTIVATE_USER: `${process.env.REACT_APP_AUTHORIZATION_API_BASE}institution-users/activate`,
  VENDORS: `${process.env.REACT_APP_TRANSLATION_ORDER_API_BASE}vendors`,
  TAGS: `${process.env.REACT_APP_TRANSLATION_ORDER_API_BASE}tags`,
  CLASSIFIER_VALUES: `${process.env.REACT_APP_TRANSLATION_ORDER_API_BASE}classifier-values`,
}

export const authEndpoints = {
  TOKEN: `realms/${process.env.REACT_APP_KEYCLOAK_realm}/protocol/openid-connect/token`,
}
