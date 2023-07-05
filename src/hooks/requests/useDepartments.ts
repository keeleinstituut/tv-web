import { DepartmentType } from 'types/departments'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { map } from 'lodash'

export const useDepartmentsFetch = () => {
  const {
    isLoading,
    isError,
    data: existingDepartments,
  } = useQuery<DepartmentType[]>({
    queryKey: ['departments'],
    queryFn: () => apiClient.get(endpoints.DEPARTMENTS),
  })

  const departmentFilters = map(existingDepartments, ({ name }) => {
    return { value: name, label: name }
  })

  return {
    existingDepartments,
    isLoading: isLoading,
    isError: isError,
    departmentFilters,
  }
}
