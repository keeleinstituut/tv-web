import { LanguageClassifierValue } from './classifierValues'
import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from './collective'
import { SourceFile } from './orders'
import { VolumeValue } from './volumes'
import { AssignmentType } from 'types/assignments'

export type GetTasksPayload = PaginationFunctionType &
  SortingFunctionType & {
    type_classifier_value_id?: string
    assigned_to_me?: number
    lang_pair?: { src?: string; dst?: string }[]
  }

type TaskLinkTypes = {
  first: string
  last: string
  prev: string
  next: string
}

type SubProject = {
  id: string
  ext_id: string
  project_id: string
  deadline_at: number
  created_at: string
  updated_at: string
  price: number
  // project: DetailedOrder
  source_language_classifier_value: LanguageClassifierValue
  destination_language_classifier_value: LanguageClassifierValue
  cat_files: SourceFile[]
}

type Assignment = {
  id: string
  sub_project_id: string
  ext_id: string
  deadline_at: number
  comments: string
  assignee_comments: string
  created_at: string
  updated_at: string
  subProject: SubProject
  volumes?: VolumeValue[]
}

export type TaskData = {
  id: string
  assignment?: Assignment
}

export type TasksDataType = {
  data: TaskData[]
  links?: TaskLinkTypes
  meta?: ResponseMetaTypes
}

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
    assigned_to_me?: boolean
    lang_pair?: { src?: string; dst?: string }[]
    task_type?: TaskType
  }

export interface ListTask {
  id: string
  task_type: TaskType
  project_id: string
  assignment: AssignmentType
}

export interface TasksResponse {
  data: ListTask[]
  meta?: ResponseMetaTypes
}

export interface TaskResponse {
  data: ListTask
}

export interface CompleteTaskPayload {
  accepted?: boolean
  final_file_id?: string[]
  // TODO: The following are currently missing from API
  // Naming might change
  sub_projects?: string[]
  comments?: string
  files?: File[]
}
