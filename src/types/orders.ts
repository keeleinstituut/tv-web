import {
  DataMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import {
  ClassifierValue,
  ClassifierValueType,
  LanguageClassifierValue,
} from './classifierValues'

// TODO: not a full list, logic behind order statuses is not fully clear yet

export enum OrderStatus {
  Registered = 'REGISTERED',
  New = 'NEW',
  Forwarded = 'FORWARDED',
  Cancelled = 'CANCELLED',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Corrected = 'CORRECTED',
}

export enum WorkflowTemplateID {
  SampleProject = 'Sample-project',
}

export interface Link {
  url: null | string
  label: string
  active: boolean
}

interface ProjectTypeConfig {
  id: string
  type_classifier_value_id: string
  workflow_process_definition_id: string
  features: string[]
  created_at: string
  updated_at: string
}
interface TypeClassifierValue extends ClassifierValue {
  type: ClassifierValueType.ProjectType
  project_type_config: ProjectTypeConfig
}

interface SourceFile {
  id: number
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
}

interface SubOrderType {
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
  sub_projects: SubOrderType[]
  // Added from detail fetch, but no available from list fetch
  // currently not added, except for type possibly
  status?: OrderStatus
  tags?: string[]
  cost?: string
}

export interface OrderDetail extends ListOrder {
  help_files: SourceFile[] // might be different type
  source_files: SourceFile[]
}

export type OrdersPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    order_id?: string
  }

export interface OrdersResponse {
  data: ListOrder[]
  meta: DataMetaTypes
}

export interface OrderResponse {
  data: OrderDetail
}
