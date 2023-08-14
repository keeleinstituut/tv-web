import { PrivilegeType } from './privileges'

export interface RolePayload {
  created_at?: string
  id?: string
  institution_id?: string
  is_root?: boolean
  name?: string
  privileges?: PrivilegeType[]
  updated_at?: string
}

export interface RolesResponse {
  data: RolePayload[]
}
