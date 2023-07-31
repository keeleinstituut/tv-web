import { DataMetaTypes } from 'types/collective'
export interface DepartmentType {
  id?: string
  institution_id?: string
  name?: string
  created_at?: string
  updated_at?: string
}
export interface DepartmentsDataType {
  data: DepartmentType[]
  meta: DataMetaTypes
}

export interface DepartmentDataType {
  data: DepartmentType
}
