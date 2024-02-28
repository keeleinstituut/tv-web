import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from './collective'
import { AssignmentType } from 'types/assignments'
import { TmStatsType, TranslationMemoryType } from './translationMemories'
import { ProjectDetail, SubProjectDetail } from './projects'

export enum TaskType {
  Default = 'DEFAULT',
  Review = 'REVIEW',
  ClientReview = 'CLIENT_REVIEW',
  Correcting = 'CORRECTING',
}

export type TasksPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    project_id?: string
    type_classifier_value_id?: string[]
    assigned_to_me?: number
    lang_pair?: { src?: string; dst?: string }[]
    task_type?: TaskType
    institution_user_id?: string
  }

export interface ListTask {
  id: string
  task_type: TaskType
  project: ProjectDetail
  project_id: string
  assignment: AssignmentType
  assignee_institution_user_id?: string
  cat_tm_keys_stats?: TmStatsType
  cat_tm_keys_meta?: {
    tags: TranslationMemoryType[]
  }
  subProject?: Partial<SubProjectDetail>
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
  sub_project_id?: string[]
  description?: string
  review_file?: File[]
}
