import { InstitutionType } from './institutions'
import { RoleType } from './roles'
import { DataMetaTypes } from 'types/collective'

interface UserDetailsType {
  created_at?: string
  updated_at?: string
  forename?: string
  surname?: string
  id: string
  personal_identification_code: string
}

export type StatusKey = 'ACTIVE' | 'DEACTIVATED' | 'ARCHIVED'

export interface UserType {
  created_at?: string
  updated_at?: string
  deactivation_date?: string
  archived_at?: string
  id: string
  // TODO: department type not clear yet, needs to be added here
  department?: string
  email?: string
  institution: InstitutionType
  phone?: string
  roles: RoleType[]
  status: StatusKey
  user: UserDetailsType
}

export interface UserPostType {
  user?: Partial<UserDetailsType>
  department_id?: string
  roles?: string[]
  phone?: string
  email?: string
}

export interface UserCsvType {
  role?: string[]
  phone?: string
  email?: string
  name?: string
  personal_identification_code?: string
  department?: string
}

export interface UserPayloadType {
  per_page?: 10 | 50 | 100
  role_id?: string[]
  status?: StatusKey[]
  sort_by?: string
  sort_order?: 'asc' | 'desc' | undefined
  department?: string[]
}

export interface UserDataType {
  data: UserType[]
  meta: DataMetaTypes
}
