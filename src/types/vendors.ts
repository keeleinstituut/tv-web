import {
  ResponseMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { UserType } from './users'
import { Price } from './price'
import { Tag } from './tags'
import { DataStateTypes } from 'components/organisms/modals/EditableListModal/EditableListModal'
import { PriceObject } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

export type SkillsData = {
  id: string
  name: string
}

export type GetSkillsPayload = {
  data?: SkillsData[]
}

export type Vendor = {
  id: string
  institution_user: UserType
  company_name: string
  prices: Price[]
  tags: Tag[]
  skills: SkillsData[]
  comment: string
  institution_user_id: string
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

export interface DiscountPercentagesAmounts {
  discount_percentage_0_49_amount: number
  discount_percentage_50_74_amount: number
  discount_percentage_75_84_amount: number
  discount_percentage_85_94_amount: number
  discount_percentage_95_99_amount: number
  discount_percentage_100_amount: number
  discount_percentage_101_amount: number
  discount_percentage_repetitions_amount: number
}

export enum DiscountPercentagesAmountNames {
  'DP_0_49_amount' = 'discount_percentage_0_49_amount',
  'DP_50_74_amount' = 'discount_percentage_50_74_amount',
  'DP_75_84_amount' = 'discount_percentage_75_84_amount',
  'DP_85_94_amount' = 'discount_percentage_85_94_amount',
  'DP_95_99_amount' = 'discount_percentage_95_99_amount',
  'DP_100_amount' = 'discount_percentage_100_amount',
  'DP_101_amount' = 'discount_percentage_101_amount',
  'DP_repetitions_amount' = 'discount_percentage_repetitions_amount',
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

export interface VendorResponse {
  data: Vendor
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

export type GetSkillsResponse = {
  data?: SkillsData[]
}

export type Prices = Omit<
  Price,
  | 'destination_language_classifier_value'
  | 'source_language_classifier_value'
  | 'created_at'
  | 'updated_at'
  | 'id'
>
export interface UpdatedPricesData {
  id?: string
  character_fee?: number
  word_fee?: number
  page_fee?: number
  minute_fee?: number
  hour_fee?: number
  minimal_fee?: number
}

export type PricesType = Omit<
  Price,
  | 'destination_language_classifier_value'
  | 'source_language_classifier_value'
  | 'created_at'
  | 'updated_at'
  | 'id'
  | 'vendor'
>

export type UpdatePricesPayload = {
  data: (
    | {
        prices: PriceObject[]
        state: DataStateTypes
      }
    | {
        prices: {
          id?: string | undefined
          skill_id: string
          vendor_id: string
          src_lang_classifier_value_id: string
          dst_lang_classifier_value_id: string
          word_fee: string | number
          page_fee: number | string
          minute_fee: number | string
          hour_fee: number | string
          minimal_fee: number | string
        }[]
        state: DataStateTypes
      }
  )[]
}

export type DeletePricesPayload = {
  id?: string[]
}
export interface PricesData extends Price {
  vendor: Vendor
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
export type CreateVendorPayload = { institution_user_id: string }[]

export type DeleteVendorsPayload = string[]
