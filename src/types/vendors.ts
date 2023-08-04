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
  meta: DataMetaTypes
}

export type VendorsPayload = Partial<Vendor> &
  PaginationFunctionType &
  SortingFunctionType
