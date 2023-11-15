import {
  ResponseMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import {
  ClassifierValue,
  ClassifierValueType,
  LanguageClassifierValue,
} from './classifierValues'
import { AssignmentType } from './assignments'
import { UserType } from './users'
import { Tag } from './tags'

// TODO: hopefully we can split these types a bit, once we have the full correct list of types

// TODO: not a full list, logic behind order statuses is not fully clear yet

export enum OrderStatus {
  Registered = 'REGISTERED',
  New = 'NEW',
  Forwarded = 'SUBMITTED_TO_CLIENT',
  Cancelled = 'CANCELLED',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Corrected = 'CORRECTED',
}

export enum SubOrderStatus {
  Registered = 'REGISTERED',
  New = 'NEW',
  ForwardedToVendor = 'FORWARDED_TO_VENDOR',
  InProgress = 'IN_PROGRESS',
  DoneTask = 'DONE_TASK',
  Cancelled = 'CANCELLED',
  Done = 'DONE',
}

export enum SubProjectFeatures {
  GeneralInformation = 'general_information',
  JobTranslation = 'job_translation',
  JobRevision = 'job_revision',
  JobOverview = 'job_overview',
}

export enum WorkflowTemplateID {
  SampleProject = 'Sample-project',
}

export enum TypesWithStartTime {
  OralTranslation = 'ORAL_TRANSLATION',
  PostTranslation = 'POST_TRANSLATION',
  SynchronousTranslation = 'SYNCHRONOUS_TRANSLATION',
  SignLanguage = 'SIGN_LANGUAGE',
}

export enum CatProjectStatus {
  Done = 'DONE',
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Failed = 'FAILED',
}
export interface Link {
  url: null | string
  label: string
  active: boolean
}

export interface ProjectTypeConfig {
  id: string
  workflow_process_definition_id: string
  created_at: string
  updated_at: string
  type_classifier_value_id: string
  is_start_date_supported: boolean
  cat_tool_enabled: boolean
  job_definitions: JobDefinition[]
}

interface TypeClassifierValue extends ClassifierValue {
  type: ClassifierValueType.ProjectType
  project_type_config: ProjectTypeConfig
}

export interface SourceFile {
  id: string
  model_type: string
  model_id: string
  uuid: string
  collection_name: string
  name: string
  file_name: string
  mime_type: string
  disk: string
  conversions_disk: string
  size: number
  order_column: number
  created_at: string
  updated_at: string
  original_url: string
  preview_url: string
  // Type not clear yet:
  manipulations: string[]
  custom_properties: string[]
  generated_conversions: string[]
  responsive_images: string[]
  isChecked?: boolean
}

export interface CatJob {
  xliff_download_url?: string
  translate_url?: string
  translation_download_url?: string
  progress_percentage?: string
  name: string
  id: number | string
  volume_analysis?: CatAnalysis[]
}

export enum TranslationMemoryPercentageNames {}

export interface CatAnalysis {
  raw_word_count: number
  total: number
  repetitions: number
  tm_101: number
  tm_100: number
  tm_95_99: number
  tm_85_94: number
  tm_75_84: number
  tm_50_74: number
  tm_0_49: number
  chunk_id: string
  files_names: string[]
}

export interface ListSubOrderDetail {
  id: string
  ext_id: string
  project_id: string
  source_language_classifier_value: LanguageClassifierValue
  destination_language_classifier_value: LanguageClassifierValue
  file_collection: string
  workflow_ref: string | null
  matecat_job_id: string | null
  source_language_classifier_value_id: string
  destination_language_classifier_value_id: string
  created_at: string
  updated_at: string
  project: ListOrder
  status?: SubOrderStatus
  deadline_at: string
  price?: string
  translation_domain_classifier_value?: ClassifierValue
  event_start_at?: string
}

export interface SubOrderDetail extends ListSubOrderDetail {
  // Others from what Markus used:
  cat_project_created: string
  cat_features: SubProjectFeatures[]
  job_definitions: JobDefinition[]
  cat_jobs: CatJob[]
  cat_analyzis: CatAnalysis[]
  cat_files: SourceFile[]
  final_files: SourceFile[]
  source_files: SourceFile[]
  assignments: AssignmentType[]
  mt_enabled: boolean
}

export interface JobDefinition {
  id: string
  job_key: SubProjectFeatures
  skill_id: string
  multi_assignments_enabled: boolean
  linking_with_cat_tool_jobs_enabled: boolean
}

export interface ListOrder {
  id: string
  ext_id: string
  reference_number: string
  institution_id: string
  type_classifier_value_id: string
  type_classifier_value?: TypeClassifierValue
  comments: string
  workflow_template_id: WorkflowTemplateID
  workflow_instance_ref: string | null
  deadline_at: string
  created_at: string
  updated_at: string
  sub_projects: ListSubOrderDetail[]
  status: OrderStatus
  tags: Tag[]
  price: string
  event_start_at?: string
}

export interface DetailedOrder extends ListOrder {
  help_files: SourceFile[] // might be different type
  source_files: SourceFile[]
  client_institution_user: UserType
  manager_institution_user?: UserType
  translation_domain_classifier_value: ClassifierValue
  // TODO: unclear type for following:
  help_file_types: string[]
  event_start_at?: string
  accepted_at?: string
  corrected_at?: string
  rejected_at?: string
  cancelled_at?: string
}

export type OrdersPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    ext_id?: string
    only_show_personal_projects?: boolean
    statuses?: string[]
  }

export type SubOrdersPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    ext_id?: string
    only_show_personal_projects?: boolean
    statuses?: string[]
  }

export interface OrdersResponse {
  data: ListOrder[]
  meta?: ResponseMetaTypes
}
export interface SubOrdersResponse {
  data: ListSubOrderDetail[]
  meta: ResponseMetaTypes
}
export interface OrderResponse {
  data: DetailedOrder
}

export interface SubOrderResponse {
  data: SubOrderDetail
}

// TODO: not sure yet
export interface SubOrderPayload {
  deadline_at?: string
  final_files?: (File | SourceFile)[]
}

export interface CatToolJobsResponse {
  data: {
    setup_status: CatProjectStatus
    analyzing_status: CatProjectStatus
    cat_jobs: CatJob[]
  }
}
// TODO: not sure what should be sent for CatProjectPayload
export interface CatProjectPayload {
  sub_project_id: string
  source_files_ids: string[]
  translation_memory_ids?: string[]
}

export interface NewOrderPayload {
  client_institution_user_id: string
  manager_institution_user_id: string
  deadline_at: string
  source_files: File[]
  reference_number?: string
  source_language_classifier_value_id: string
  destination_language_classifier_value_ids: string[]
  help_files?: File[]
  help_file_types?: string[]
  translation_domain_classifier_value_id: string
  type_classifier_value_id: string
  event_start_at?: string
  // TODO: Following are currently missing
  comments?: string
}

export interface CatJobsPayload {
  sub_project_id: string
  chunks_count?: number
}
export interface SplitOrderPayload {
  sub_project_id: string
  job_key: SubProjectFeatures
}

export interface CancelOrderPayload {
  reason: string
  comments?: string
}
