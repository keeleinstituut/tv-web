import { DepartmentsDataType } from 'types/departments'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { map } from 'lodash'

import { EditDataType } from 'components/organisms/modals/EditableListModal/EditableListModal'

export const useDepartmentsFetch = () => {
  const { isLoading, isError, data } = useQuery<DepartmentsDataType>({
    queryKey: ['departments'],
    queryFn: () => apiClient.get(endpoints.DEPARTMENTS),
  })
  const { data: existingDepartments } = data || {}

  const departmentFilters = map(existingDepartments, ({ name, id }) => {
    return { value: id, label: name }
  })

  return {
    existingDepartments,
    isLoading: isLoading,
    isError: isError,
    departmentFilters,
  }
}

export const useBulkUpdateDepartments = () => {
  const queryClient = useQueryClient()

  const { mutateAsync: bulkUpdateDepartments, isLoading } = useMutation({
    mutationKey: ['departments'],
    mutationFn: (payload: EditDataType[]) => {
      return apiClient.put(endpoints.DEPARTMENTS_BULK, {
        data: payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['departments'],
        (oldData?: DepartmentsDataType) => {
          return { data }
        }
      )
    },
  })

  return {
    bulkUpdateDepartments,
    isLoading,
  }
}
