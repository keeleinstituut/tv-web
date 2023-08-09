import {
  DataMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { UserType } from './users'
import { Price } from './price'
import { Tag } from './tags'
export interface Vendor {
  id?: string
  institution_user: UserType
  company_name: string
  prices: Price[]
  tags: Tag[]
  comment: string
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
  id?: string
  name?: string
}

export type GetSkillsPayload = {
  data?: SkillsData[]
}

export type PricesData = {
  id?: string
  name?: string
}

export type GetVendorPricesPayload = {
  data?: PricesData[]
}
