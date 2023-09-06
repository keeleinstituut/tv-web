import { ResponseMetaTypes } from 'types/collective'
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
}
export interface GetPricesPayload {
  vendor_id?: string
  institution_user_name?: string
  src_lang_classifier_value_id?: string[]
  dst_lang_classifier_value_id?: string[]
  skill_id?: string[]
  limit?: number
  order_by?: string
  order_direction?: string
}

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
