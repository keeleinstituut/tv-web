import {
  LinkTypes,
  PaginationFunctionType,
  ResponseMetaTypes,
} from './collective'
import { UserDetailsType } from './users'

export enum EventTypes {
  LogIn = 'LOG_IN',
  LogOut = 'LOG_OUT',
  selectedInstitution = 'SELECT_INSTITUTION',
  CreateObject = 'CREATE_OBJECT',
  ModifyObject = 'MODIFY_OBJECT',
  RemoveObject = 'REMOVE_OBJECT',
  CompleteAssignment = 'COMPLETE_ASSIGNMENT',
  FinishProject = 'FINISH_PROJECT',
  ApproveAssignmentResult = 'APPROVE_ASSIGNMENT_RESULT',
  RejectAssignmentResult = 'REJECT_ASSIGNMENT_RESULT',
  RewindWorkflow = 'REWIND_WORKFLOW',
  DispatchNotification = 'DISPATCH_NOTIFICATION',
  DownloadProjectFile = 'DOWNLOAD_PROJECT_FILE',
  ExportInstitutionUsers = 'EXPORT_INSTITUTION_USERS',
  ExportProjectsReport = 'EXPORT_PROJECTS_REPORT',
  ExportTranslationMemory = 'EXPORT_TRANSLATION_MEMORY',
  ImportTranslationMemory = 'IMPORT_TRANSLATION_MEMORY',
  SearchLogs = 'SEARCH_LOGS',
  ExportLogs = 'EXPORT_LOGS',
}

export enum ObjectTypes {
  Institution = 'INSTITUTION',
  InstitutionUser = 'INSTITUTION_USER',
  InstitutionDiscount = 'INSTITUTION_DISCOUNT',
  Role = 'ROLE',
  Vendor = 'VENDOR',
  Project = 'PROJECT',
  SubProject = 'SUBPROJECT',
  Assignment = 'ASSIGNMENT',
  TranslationMemory = 'TRANSLATION_MEMORY',
}

export type AuditLogPayloadType = {
  start_datetime?: string
  end_datetime?: string
  department_id?: string
  event_type?: string
  text?: string
} & PaginationFunctionType

export type AuditLogsResponse = {
  id: string
  happened_at: string
  acting_user_pic: string
  acting_user_forename: string
  acting_user_surname: string
  acting_institution_user_id: string
  trace_id: string
  context_department_id: string
  context_institution_id: string
  failure_type: string | unknown | null
  event_type: EventTypes
  event_parameters?: EventParameters | null
}
export type EventParameters = {
  //"REJECT_ASSIGNMENT_RESULT
  assignment_id?: string
  assignment_ext_id?: string
  //"SEARCH_LOGS"
  query_start_datetime?: string
  query_end_datetime?: string
  query_event_type?: string
  query_text?: string
  query_department_id?: string
  //IMPORT_TRANSLATION_MEMORY
  translation_memory_id?: string
  translation_memory_name?: string
  //"EXPORT_PROJECTS_REPORT"
  query_start_date?: string
  query_end_date?: string
  query_status?: string
  //"DOWNLOAD_PROJECT_FILE"
  media_id?: string
  project_id?: string
  project_ext_id?: string
  file_name?: string
  //"REWIND_WORKFLOW"
  workflow_id?: string
  workflow_name?: string
  //"DISPATCH_NOTIFICATION"
  //TODO: null
} & ObjectParameters

export type ObjectParameters = {
  object_type?: ObjectTypes
  object_identity_subset?: {
    id?: string
    name?: string
    ext_id?: string
    institution_user?: {
      id?: string
      user?: Partial<UserDetailsType>
    }
    user?: Partial<UserDetailsType>
  }
  object_data?: object | unknown
  pre_modification_subset?: object | unknown
  post_modification_subset?: object | unknown
}

export interface AuditLogsResponseDataType {
  data: AuditLogsResponse[]
  links: LinkTypes
  meta: ResponseMetaTypes
}
