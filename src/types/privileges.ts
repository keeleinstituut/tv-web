export type PrivilegeKey =
  | 'ADD_ROLE'
  | 'VIEW_ROLES'
  | 'EDIT_ROLE'
  | 'DELETE_ROLE'
  | 'ADD_USER'
  | 'EDIT_USER'
  | 'EXPORT_USER'
  | 'ACTIVATE_USER'
  | 'DEACTIVATE_USER'
  | 'ARCHIVE_USER'
  | 'CREATE_TM'
  | 'IMPORT_TM'
  | 'EXPORT_TM'
  | 'DELETE_TM'
  | 'EDIT_TM_METADATA'
  | 'VIEW_TM'
  | 'CREATE_PROJECT'
  | 'MANAGE_PROJECT'
  | 'RECEIVE_AND_MANAGE_PROJECT'
  | 'VIEW_PERSONAL_PROJECTS'
  | 'VIEW_INSTITUTION_PROJECT_LIST'
  | 'VIEW_INSTITUTION_PROJECT_DETAILS'
  | 'CHANGE_CLIENT'
  | 'VIEW_PERSONAL_TASKS'
  | 'EXPORT_INSTITUTION_GENERAL_REPORT'
  | 'ADD_TAG'
  | 'EDIT_TAG'
  | 'DELETE_TAG'
  | 'VIEW_AUDIT_LOGS'
  | 'EXPORT_AUDIT_LOGS'
  | 'VIEW_VENDOR_DB'
  | 'EDIT_VENDOR_DB'
  | 'VIEW_GENERAL_PRICELIST'
  | 'VIEW_VENDOR_TASKS'
  | 'VIEW_INSTITUTION_PRICE_RATE'
  | 'EDIT_INSTITUTION_PRICE_RATE'
  | 'EDIT_INSTITUTION_DATA'
  | 'EDIT_INSTITUTION_WORK_TIMES'
  | 'ADD_DEPARTMENT'
  | 'EDIT_DEPARTMENT'
  | 'DELETE_DEPARTMENT'
  | 'EDIT_USER_WORKTIME'

export interface PrivilegeType {
  key: PrivilegeKey
}
