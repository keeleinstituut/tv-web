import { LanguageClassifierValue } from './classifierValues'
import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from './collective'
import { DetailedOrder, SourceFile } from './orders'
import { VolumeValue } from './volumes'

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
  project: DetailedOrder
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
