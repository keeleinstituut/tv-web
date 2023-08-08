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
  discount_percentage_0_49?: string
  discount_percentage_50_74?: string
  discount_percentage_75_84?: string
  discount_percentage_85_94?: string
  discount_percentage_95_99?: string
  discount_percentage_100?: string
  discount_percentage_101?: string
  discount_percentage_repetitions?: string
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
