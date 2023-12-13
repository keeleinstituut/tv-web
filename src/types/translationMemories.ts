import { PaginationFunctionType, SortingFunctionType } from './collective'

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
  lang_pair?: string | string[]
  name?: string
  type?: TMType | TMType[]
  tv_domain?: string | string[]
} & PaginationFunctionType &
  SortingFunctionType

export interface ImportTMXPayload {
  file: File
  tag: string
}

export interface ExportTMXPayload {
  slang: string
  tlang: string
  tag: string
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
  sub_project_id: string
  is_writable?: boolean
  tm_keys: {
    key: string
  }[]
}
