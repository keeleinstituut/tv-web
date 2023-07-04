import { PrivilegeType } from './privileges'

export interface RoleType {
  created_at?: string
  id?: string
  institution_id?: string
  is_root?: boolean
  name?: string
  privileges?: PrivilegeType[]
  updated_at?: string
}
