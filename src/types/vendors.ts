import {
  ResponseMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { UserType } from './users'
import { LanguageClassifierValue, Price } from './price'
import { Tag } from './tags'

export type Vendor = {
  id?: string
  institution_user: UserType
  company_name: string
  prices: Price[]
  tags: Tag[]
  comment: string
} & DiscountPercentages

export type DiscountPercentages = {
  discount_percentage_0_49: string
  discount_percentage_50_74: string
  discount_percentage_75_84: string
  discount_percentage_85_94: string
  discount_percentage_95_99: string
  discount_percentage_100: string
  discount_percentage_101: string
  discount_percentage_repetitions: string
}

export enum DiscountPercentageNames {
  'DP_0_49' = 'discount_percentage_0_49',
  'DP_50_74' = 'discount_percentage_50_74',
  'DP_75_84' = 'discount_percentage_75_84',
  'DP_85_94' = 'discount_percentage_85_94',
  'DP_95_99' = 'discount_percentage_95_99',
  'DP_100' = 'discount_percentage_100',
  'DP_101' = 'discount_percentage_101',
  'DP_repetitions' = 'discount_percentage_repetitions',
}

export interface VendorsDataType {
  data: Vendor[]
  meta?: ResponseMetaTypes
}

export type GetVendorsPayload = Partial<Vendor> &
  PaginationFunctionType &
  SortingFunctionType

export type UpdateVendorPayload = {
  company_name?: string
  prices?: string[]
  tags?: string[]
  comment?: string
}

export type SkillsData = {
  id: string
  name: string
}

export type GetSkillsPayload = {
  data?: SkillsData[]
}

export interface Prices {
  id?: string
  vendor_id?: string
  skill_id?: string
  src_lang_classifier_value_id?: string
  dst_lang_classifier_value_id?: string
  character_fee?: number
  word_fee?: number
  page_fee?: number
  minute_fee?: number
  hour_fee?: number
  minimal_fee?: number
}
export interface UpdatedPricesData {
  id?: string
  character_fee?: number
  word_fee?: number
  page_fee?: number
  minute_fee?: number
  hour_fee?: number
  minimal_fee?: number
}

export type CreatePricesPayload = {
  data?: Prices[]
}

export type UpdatePricesPayload = {
  data?: UpdatedPricesData[]
}
export type DeletePricesPayload = {
  id?: string[]
}

export type PricesData = {
  id: string
  vendor_id: string | undefined
  skill_id: string
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  updated_at: string
  created_at: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  vendor?: Vendor
  source_language_classifier_value: LanguageClassifierValue
  destination_language_classifier_value: LanguageClassifierValue
  skill?: SkillsData
}

export type UpdatedPrices = {
  data?: PricesData[]
}

export type PricesDataType = {
  data: PricesData[]
  meta?: ResponseMetaTypes
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

export enum OrderBy {
  CharacterFee = 'character_fee',
  WordFee = 'word_fee',
  PageFee = 'page_fee',
  MinuteFee = 'minute_fee',
  HourFee = 'hour_fee',
  MinimalFee = 'minimal_fee',
  CreatedAt = 'created_at',
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}
