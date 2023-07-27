import { DataMetaTypes } from 'types/collective'
import { UserType } from './users'
import { Price } from './price'
export interface VendorType {
  id?: string
  institution_user: UserType
  company_name: string
  prices: Price[]
  tags: any[] // TODO: when types ready add them
}
export interface VendorsDataType {
  data: VendorType[]
  meta: DataMetaTypes
}
