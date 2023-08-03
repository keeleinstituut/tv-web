import { PaginationFunctionType, SortingFunctionType } from './collective'

export enum ClassifierValueType {
  Language = 'LANGUAGE',
  ProjectType = 'PROJECT_TYPE',
  TranslationDomain = 'TRANSLATION_DOMAIN',
}
export interface ClassifierValue {
  id: string
  type: ClassifierValueType
  value: string
  name: string
  synced_at: string | null
  deleted_at: string | null
}

export interface LanguageClassifierValue extends ClassifierValue {
  type: ClassifierValueType.Language
}

export type ClassifierValuesPayload = PaginationFunctionType &
  SortingFunctionType & {
    type: ClassifierValueType
  }

export interface ClassifierValuesDataTypes {
  data: ClassifierValue[]
}
