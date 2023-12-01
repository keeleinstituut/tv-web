import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from './collective'
import { AssignmentType } from 'types/assignments'

export enum TaskType {
  Default = 'DEFAULT',
  Review = 'REVIEW',
  ClientReview = 'CLIENT_REVIEW',
  Correcting = 'CORRECTING',
}

export type TasksPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    project_id?: string
    type_classifier_value_id?: string
    assigned_to_me?: number
    lang_pair?: { src?: string; dst?: string }[]
    task_type?: TaskType
  }

export interface ListTask {
  id: string
  task_type: TaskType
  project_id: string
  assignment: AssignmentType
  assignee_institution_user_id?: string
}

export interface TasksResponse {
  data: ListTask[]
  meta?: ResponseMetaTypes
}

export interface TaskResponse {
  data: ListTask
}

export interface CompleteTaskPayload {
  accepted?: number | boolean
  final_file_id?: string[]
  // TODO: The following are currently missing from API
  // Naming might change
  sub_project_id?: string[]
  description?: string
  review_file?: File[]
}
