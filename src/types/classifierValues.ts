import { PaginationFunctionType, SortingFunctionType } from './collective'

export interface ClassifierValues {
  id: string
  type: string
  value: string
  name: string
}

export type ClassifierValuesPayload = PaginationFunctionType &
  SortingFunctionType & {
    type: string
  }

export interface ClassifierValuesDataTypes {
  data: ClassifierValues[]
}
