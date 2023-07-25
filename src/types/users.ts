import { InstitutionType } from './institutions'
import { RoleType } from './roles'
import {
  DataMetaTypes,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'

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

export type UserPayloadType = PaginationFunctionType &
  SortingFunctionType & {
    role_id?: string[]
    status?: StatusKey[]
    department?: string[]
  }

export interface UsersDataType {
  data: UserType[]
  meta?: DataMetaTypes
}

export interface UserDataType {
  data: UserType
}

export interface UserStatusType {
  institution_user_id?: string
  roles?: string[]
  notify_user?: boolean
  deactivation_date?: string
}
