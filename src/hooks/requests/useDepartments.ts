import {
  DepartmentDataType,
  DepartmentType,
  DepartmentsDataType,
} from 'types/departments'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { filter, map } from 'lodash'
import useAuth from 'hooks/useAuth'
import { useCallback } from 'react'

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

export const useCreateDepartment = () => {
  const { userInfo } = useAuth()
  const queryClient = useQueryClient()
  const { mutateAsync: createDepartment, isLoading } = useMutation({
    mutationKey: ['departments'],
    mutationFn: (payload: DepartmentType) =>
      apiClient.post(endpoints.DEPARTMENTS, {
        institution_id: userInfo?.tolkevarav?.selectedInstitution?.id,
        ...payload,
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['department'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: DepartmentsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, data]
          return { data: newData }
        }
      )
    },
  })

  return {
    createDepartment,
    isLoading,
  }
}
export const useDeleteDepartment = ({
  departmentId,
}: {
  departmentId?: string
}) => {
  const queryClient = useQueryClient()
  const { mutate: deleteDepartment, isLoading } = useMutation({
    mutationKey: ['departments', departmentId],
    mutationFn: () =>
      apiClient.delete(`${endpoints.DEPARTMENTS}/${departmentId}`),
    onSuccess: () => {
      queryClient.setQueryData(
        ['departments', departmentId],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: DepartmentsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const deletedData = filter(
            previousData,
            ({ id }) => id !== departmentId
          )
          return { data: deletedData }
        }
      )
    },
  })

  const wrappedDeleteDepartment = useCallback(() => {
    deleteDepartment()
  }, [deleteDepartment])

  return {
    deleteDepartment: wrappedDeleteDepartment,
    isLoading,
  }
}
