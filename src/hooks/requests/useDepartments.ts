import {
  DepartmentDataType,
  DepartmentType,
  DepartmentsDataType,
} from 'types/departments'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { map } from 'lodash'

export const useDepartmentsFetch = () => {
  const { isLoading, isError, data } = useQuery<DepartmentsDataType>({
    queryKey: ['departments'],
    queryFn: () => apiClient.get(endpoints.DEPARTMENTS),
  })
  const { data: existingDepartments } = data || {}

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

export const useUpdateDepartment = ({
  departmentId,
}: {
  departmentId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateDepartment, isLoading } = useMutation({
    mutationKey: ['departments', departmentId],
    mutationFn: (payload: DepartmentType) =>
      apiClient.put(`${endpoints.DEPARTMENTS}/${departmentId}`, {
        ...payload,
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['departments', departmentId],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: DepartmentDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newArray = { ...previousData, ...data }
          return { data: newArray }
        }
      )
    },
  })

  return {
    updateDepartment,
    isLoading,
  }
}
