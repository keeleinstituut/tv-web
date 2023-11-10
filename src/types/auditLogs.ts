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
  start_datetime: string
  end_datetime: string
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
  event_type: string
  event_parameters?: EventParameters | null
}
interface EventParameters {
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
  //"FINISH_PROJECT"
  //   project_id: 'string'
  //   project_ext_id: 'string'
  //"REWIND_WORKFLOW"
  workflow_id?: string
  workflow_name?: string

  //Object activities

  //"CREATE_OBJECT"
  object_type?: ObjectTypes
  object_data?: object | unknown
  //"REMOVE_OBJECT"
  // object_type: 'INSTITUTION'
  object_identity_subset?: {
    id?: string
    name?: string
    ext_id?: string
    institution_user?: {
      id?: string
      user?: Partial<UserDetailsType>
    }
    user?: Partial<UserDetailsType>
  } | null
  //"MODIFY_OBJECT"
  pre_modification_subset?: object | unknown
  post_modification_subset?: object | unknown
  //object_type: 'INSTITUTION'
  //   object_identity_subset: {
  //     id: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  //     name: 'string'
  //   }

  //"DISPATCH_NOTIFICATION"
  //TODO: null
}

export interface AuditLogsResponseDataType {
  data: AuditLogsResponse
  links: LinkTypes
  meta: ResponseMetaTypes
}
