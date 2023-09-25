import { Tag } from './tags'
import { DepartmentType } from './departments'

export enum TranslationMemoryStatus {
  Internal = 'INTERNAL',
  Shared = 'SHARED',
  Public = 'PUBLIC',
}

export interface TranslationMemoryType {
  id: string
  institution_id: string
  name: string
  type?: TranslationMemoryStatus
  tags?: Tag[]
  translation_domain?: string
}

export interface TranslationMemoryPostType {
  id: string
  name: string
  type?: TranslationMemoryStatus
}

export interface TranslationMemoryDataType {
  data: TranslationMemoryType[]
}

export interface TranslationMemoryPayload {
  slang: string
  tlang: string
  name: string
  type: TranslationMemoryStatus
  translation_domain?: string
}

export interface ImportTMXPayload {
  file: File
  tag: string
  lang_pair?: string
}

export interface ExportTMXPayload {
  slang: string
  tlang: string
}
