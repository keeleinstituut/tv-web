import {
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from 'types/collective'
import { Vendor } from './vendors'

export enum PriceUnits {
  CharacterFee = 'character_fee',
  WordFee = 'word_fee',
  PageFee = 'page_fee',
  MinuteFee = 'minute_fee',
  HourFee = 'hour_fee',
  MinimalFee = 'minimal_fee',
}

export interface Price {
  id: string
  vendor_id: string
  skill_id: string
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  created_at: string
  updated_at: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  source_language_classifier_value: LanguageClassifierValue
  destination_language_classifier_value: LanguageClassifierValue
  vendor: Vendor
  skill: { id: string; name: string }
}

export interface GetPricesFilters {
  vendor_id?: string
  lang_pair?: { src?: string; dst?: string }[]
  institution_user_name?: string
  src_lang_classifier_value_id?: Array<string | undefined>
  dst_lang_classifier_value_id?: Array<string | undefined>
  skill_id?: string[]
  tag_id?: string[]
}

export type GetPricesPayload = SortingFunctionType &
  PaginationFunctionType &
  GetPricesFilters

export type PricesDataType = {
  data: Price[]
  meta?: ResponseMetaTypes
}
export interface LanguageClassifierValue {
  id: string
  type: string
  value: string
  name: string
}
