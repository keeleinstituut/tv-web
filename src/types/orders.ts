import {
  DataMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'

// TODO: not a full list, logic behind order statuses is not fully clear yet
export type OrderStatus =
  | 'REGISTERED'
  | 'NEW'
  | 'FORWARDED'
  | 'CANCELLED'
  | 'ACCEPTED'
  | 'REJECTED'

interface ClassifierValue {
  value: string
}

export interface SubOrderType {
  id: string
  src_lang: ClassifierValue
  dst_lang: ClassifierValue
  // might use parent orders reference_number instead
  workflow_ref: string
  // TODO: following are missing
  type?: ClassifierValue
  status?: OrderStatus
  cost?: string
  deadline_at?: string
}

export interface OrderType {
  id: string
  reference_number: string
  sub_projects: SubOrderType[]
  deadline_at: string
  // TODO: following are currently missing from data
  order_id?: string
  type?: ClassifierValue
  status?: OrderStatus
  tags?: string[]
  cost?: string
}

export type OrdersPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    order_id?: string
  }

export interface OrdersDataType {
  data: OrderType[]
  meta: DataMetaTypes
}
