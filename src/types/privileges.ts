export enum Privileges {
  AddRole = 'ADD_ROLE',
  ViewRole = 'VIEW_ROLE',
  EditRole = 'EDIT_ROLE',
  DeleteRole = 'DELETE_ROLE',
  ViewUser = 'VIEW_USER',
  AddUser = 'ADD_USER',
  EditUser = 'EDIT_USER',
  ExportUser = 'EXPORT_USER',
  ActivateUser = 'ACTIVATE_USER',
  DeactivateUser = 'DEACTIVATE_USER',
  ArchiveUser = 'ARCHIVE_USER',
  CreateTm = 'CREATE_TM',
  ImportTm = 'IMPORT_TM',
  ExportTm = 'EXPORT_TM',
  DeleteTm = 'DELETE_TM',
  EditTmMetadata = 'EDIT_TM_METADATA',
  ViewTm = 'VIEW_TM',
  CreateProject = 'CREATE_PROJECT',
  ManageProject = 'MANAGE_PROJECT',
  ReceiveAndManageProject = 'RECEIVE_AND_MANAGE_PROJECT',
  ViewPersonalProject = 'VIEW_PERSONAL_PROJECT',
  ViewInstitutionProjectList = 'VIEW_INSTITUTION_PROJECT_LIST',
  ViewInstitutionProjectDetail = 'VIEW_INSTITUTION_PROJECT_DETAIL',
  ChangeClient = 'CHANGE_CLIENT',
  ViewPersonalTask = 'VIEW_PERSONAL_TASK',
  ExportInstitutionGeneralReport = 'EXPORT_INSTITUTION_GENERAL_REPORT',
  AddTag = 'ADD_TAG',
  EditTag = 'EDIT_TAG',
  DeleteTag = 'DELETE_TAG',
  ViewAuditLog = 'VIEW_AUDIT_LOG',
  ExportAuditLog = 'EXPORT_AUDIT_LOG',
  ViewVendorDb = 'VIEW_VENDOR_DB',
  EditVendorDb = 'EDIT_VENDOR_DB',
  ViewGeneralPricelist = 'VIEW_GENERAL_PRICELIST',
  ViewVendorTask = 'VIEW_VENDOR_TASK',
  ViewInstitutionPriceRate = 'VIEW_INSTITUTION_PRICE_RATE',
  EditInstitutionPriceRate = 'EDIT_INSTITUTION_PRICE_RATE',
  EditInstitution = 'EDIT_INSTITUTION',
  EditInstitutionWorktime = 'EDIT_INSTITUTION_WORKTIME',
  AddDepartment = 'ADD_DEPARTMENT',
  EditDepartment = 'EDIT_DEPARTMENT',
  DeleteDepartment = 'DELETE_DEPARTMENT',
  EditUserWorktime = 'EDIT_USER_WORKTIME',
  EditUserVacation = 'EDIT_USER_VACATION',
}

export type PrivilegeKey = `${Privileges}`

export interface PrivilegeType {
  key: PrivilegeKey
}
export interface PrivilegeDataType {
  data: PrivilegeType[]
}
