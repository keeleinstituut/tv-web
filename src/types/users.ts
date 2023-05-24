import { InstitutionType } from './institutions'
import { RoleType } from './roles'

interface UserDetailsType {
  created_at?: string
  updated_at?: string
  forename?: string
  surname?: string
  id: string
  personal_identification_code: string
}

// TODO: update list of possible statuskeys
export type StatusKey = 'ACTIVATED' | 'DEACTIVATED'

export interface UserType {
  created_at?: string
  updated_at?: string
  id: string
  // TODO: department type not clear yet, needs to be added here
  department?: string | null
  email?: string
  institution: InstitutionType
  phone?: string
  roles: RoleType[]
  status: StatusKey
  user: UserDetailsType
}
