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
  edit_url?: string
  import_at?: string
}

export interface TranslationMemoryDataType {
  tags?: TranslationMemoryType[]
  data?: TranslationMemoryType[]
  segment_counts?: Record<string, number>
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

export type TranslationMemoryFilters = {
  lang_pair?: string[]
  name?: string
  type?: TMType | TMType[]
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
  slang: string
  tlang: string
  tag: string | string[]
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

