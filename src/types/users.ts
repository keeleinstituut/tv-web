import { InstitutionType } from './institutions'
import { Privileges } from './privileges'
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

export enum UserStatus {
  Active = 'ACTIVE',
  Deactivated = 'DEACTIVATED',
  Archived = 'ARCHIVED',
}
export interface UserType {
  created_at?: string
  updated_at?: string
  deactivation_date?: string
  archived_at?: string
  id: string
  // TODO: department type not clear yet, needs to be added here
  department?: string[]
  email?: string
  institution: InstitutionType
  phone?: string
  roles: RoleType[]
  status: UserStatus
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
    // status?: UserStatus[]
    statuses?: UserStatus[]
    department?: string[]
    // TODO: not sure if these fields will be called name and privileges or something else
    name?: string
    privileges?: Privileges[]
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
  deactivation_date?: string | null
}
