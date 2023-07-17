import { UserPayloadType } from './users'

interface LinkTypes {
  url?: string
  label?: string
  active?: boolean
}

export interface DataMetaTypes {
  current_page: number
  from?: number
  last_page?: number
  links?: LinkTypes[]
  path?: string
  per_page: number
  to?: number
  total: number
}
export interface FilterFunctionType {
  [filterKey: string]: string | number | string[]
}
export interface SortingFunctionType {
  sort_order?: 'asc' | 'desc' | undefined
  sort_by?: string
}

export interface PaginationFunctionType {
  per_page?: UserPayloadType['per_page']
  page?: number
}
