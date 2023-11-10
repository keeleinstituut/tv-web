import { DepartmentsDataType, PromiseErrorType } from 'types/departments'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { compact, isEmpty, map } from 'lodash'

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

const requestsPromiseThatThrowsAnErrorWhenSomeRequestsFailed = (
  payload: EditDataType[]
) =>
  new Promise(async (resolve, reject) => {
    const results: PromiseErrorType[] = await Promise.allSettled(
      map(payload, ({ state, id, name }) => {
        if (state === 'NEW') {
          return apiClient.post(endpoints.DEPARTMENTS, { name })
        }
        if (state === 'UPDATED') {
          return apiClient.put(`${endpoints.DEPARTMENTS}/${id}`, { name })
        }
        if (state === 'DELETED') {
          return apiClient.delete(`${endpoints.DEPARTMENTS}/${id}`)
        }
      })
    )

    const fulfilled = compact(
      map(results, ({ status, value }, key) => {
        if (status === 'fulfilled') {
          if (value) {
            return {
              key,
              value,
            }
          }
        }
      })
    )

    const errors = compact(
      map(results, ({ status, reason, value }, key) => {
        if (status === 'rejected') {
          const { message, errors: err } = reason || {}
          const name = `department.${key}`
          const error = {
            errors: { [name]: err?.name || [] },
            message: message || '',
            name: key,
          }
          return error
        }
      })
    )

    if (isEmpty(errors)) {
      resolve(results)
    } else {
      reject([...errors, { values: fulfilled }])
    }
  })

export const useParallelMutationDepartment = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: parallelUpdating, isLoading } = useMutation({
    mutationKey: ['departments'],
    mutationFn: async (payload: EditDataType[]) =>
      requestsPromiseThatThrowsAnErrorWhenSomeRequestsFailed(payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['departments'], type: 'active' })
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['departments'], type: 'active' })
    },
  })

  return { parallelUpdating, isLoading }
}
