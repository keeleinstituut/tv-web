import { PrivilegeType } from './privileges'

export interface RoleType {
  created_at?: string
  id?: string
  institution_id?: string
  name?: string
  privileges?: PrivilegeType[]
  updated_at?: string
}

export interface RolesDataTypes {
  data: RoleType[]
}
