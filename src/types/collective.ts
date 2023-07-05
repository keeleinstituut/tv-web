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
