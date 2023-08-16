import {
  DataMetaTypes,
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
  meta?: DataMetaTypes
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
  vendor_id: string | undefined
  skill_id: string
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
}

export type UpdatePricesPayload = {
  data?: Prices[]
}

export type PricesData = {
  vendor_id: string | undefined
  skill_id: string
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  skill: SkillsData
  source_language_classifier_value: LanguageClassifierValue
  destination_language_classifier_value: LanguageClassifierValue
  created_at: string
  updated_at: string
  id: string
  vendor: {
    comment: string
    company_name?: string
    created_at: string
    id?: string
    institution_user: UserType
    institution_user_id: string
    discount_percentage_0_49: string
    discount_percentage_50_74: string
    discount_percentage_75_84: string
    discount_percentage_85_94: string
    discount_percentage_95_99: string
    discount_percentage_100: string
    discount_percentage_101: string
    discount_percentage_repetitions: string
  }
}

export type PricesDataType = {
  data: PricesData[]
}
