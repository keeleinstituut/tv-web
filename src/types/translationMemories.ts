import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from './collective'

export enum TMType {
  Internal = 'private',
  Shared = 'shared',
  Public = 'public',
}

export interface TranslationMemoryType {
  id: string
  institution_id: string
  name: string
  type?: TMType
  tv_tags?: string[]
  tv_domain?: string
  comment?: string
  created_at: string
  lang_pair: string
  chunk_amount?: string | number
  import_at?: string
}

export interface TranslationMemoryDataType {
  tags?: TranslationMemoryType[]
  data?: TranslationMemoryType[]
}

export interface TranslationMemoryPostType {
  name: string
  type?: TMType
  tv_tags?: string[]
  tv_domain?: string
  comment?: string
}

export type TranslationMemoryPayload = {
  lang_pair?: string
  name?: string
  type?: TMType
  tv_domain?: string
}
export interface TmStatsType {
  lang_pairs?: { [lang_pair: string]: object }
  tag?: { [tm_key: string]: number }
}

export type TranslationMemoryFilters = {
  lang_pair?: string[]
  name?: string
  type?: TMType | TMType[]
  tv_domain?: string | string[]
  tv_tags?: string[]
} & PaginationFunctionType &
  SortingFunctionType

export interface ImportTMXPayload {
  file: File
  tag: string
}

export interface ExportTMXPayload {
  slang: string
  tlang: string
  tag: string | string[]
}

export interface SubProjectTmKeys {
  id: string
  sub_project_id: string
  key: string
  is_writable: boolean
}

export interface SubProjectTmKeysResponse {
  data: SubProjectTmKeys[]
}
export interface SubProjectTmKeysPayload {
  id?: string
  sub_project_id?: string
  is_writable?: number
  tm_keys?: {
    key: string
  }[]
  key?: string
  created_as_empty?: number
}

export type ContextCheckPayload = {
  tag_id: string
}

export type ContextCheckFilters = {
  tag_id?: string
} & PaginationFunctionType &
  SortingFunctionType

export interface ContextCheckType {
  id: string
  segments_checked_count: number | null
  segments_count: number | null
  segments_failed_count: number | null
  segments_passwed_count: number | null
  status: string

  finished_at: string
  created_at: string
}

export interface ContextCheckListResponse {
  data: ContextCheckType[]
  meta?: ResponseMetaTypes
}
