import {
  ResponseMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { UserType } from './users'
import { Price } from './price'
import { Tag } from './tags'

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

export type CreateVendorPayload = { institution_user_id: string }[]

export type DeleteVendorsPayload = string[]
