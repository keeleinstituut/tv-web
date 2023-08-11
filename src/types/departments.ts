import { ValidationError } from 'api/errorHandler'
import {
  DataStateTypes,
  EditDataType,
} from 'components/organisms/modals/EditableListModal/EditableListModal'
import { DataMetaTypes } from 'types/collective'
export interface DepartmentType {
  data: any
  id: string
  institution_id?: string
  name: string
  created_at?: string
  updated_at?: string
}
export interface DepartmentsDataType {
  data: DepartmentType[]
  meta?: DataMetaTypes
}

export interface DepartmentDataType {
  data: DepartmentType
}

export type DepartmentPayload = {
  [key in DataStateTypes]?: EditDataType[]
}

export type PromiseErrorType = {
  status: string
  value?: DepartmentType
  reason?: ValidationError
}
