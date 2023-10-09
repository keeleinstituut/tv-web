import { PaginationFunctionType } from './collective'

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
  chunk_amount?: string
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
} & PaginationFunctionType

export interface ImportTMXPayload {
  file: File
  tag: string
}

export interface ExportTMXPayload {
  slang: string
  tlang: string
  tag: string
}
