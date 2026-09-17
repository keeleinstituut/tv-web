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

export interface TranslationMemoryMetaType {
  tv_domain?: string
  tv_tags?: string[]
  comment?: string
}

export interface TranslationMemoryType {
  id: string
  name: string
  source_locale?: string
  target_locale?: string
  tenant_id?: string
  visibility?: TMType
  created_at: string
  import_at?: string
  meta: TranslationMemoryMetaType
}

export interface TranslationMemoryResponse {
  data: TranslationMemoryType
  segment_count?: number
  edit_url?: string
}

export interface TranslationMemoryDataType {
  data?: TranslationMemoryType[]
  segment_counts?: Record<string, number>
}

export interface TranslationMemoryPostType {
  name?: string
  visibility?: TMType
  meta?: {
    tv_domain?: string
    tv_tags?: string[]
    comment?: string
  }
}

export type TranslationMemoryPayload = {
  name: string
  source_locale: string
  target_locale: string
  tenant_id?: string
  visibility?: TMType
  meta?: {
    tv_domain?: string
  }
}

export type TranslationMemoryFilters = {
  lang_pair?: string[]
  name?: string
  visibility?: TMType | TMType[]
  tv_domain?: string | string[]
  tv_tags?: string[]
  with_segment_count?: number
} & PaginationFunctionType &
  SortingFunctionType

export interface ImportTMXPayload {
  file: File
  tag: string
}

export interface ExportTMXPayload {
  translation_memory_ids: string[]
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

