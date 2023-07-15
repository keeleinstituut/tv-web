import {
  UserPostType,
  UsersDataType,
  UserPayloadType,
  UserDataType,
} from 'types/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FilterFunctionType,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { useState } from 'react'
import { isEmpty, keys, omit } from 'lodash'

export const useFetchUsers = () => {
  const [filters, setFilters] = useState<UserPayloadType>({})

  const handelFilterChange = (value?: FilterFunctionType) => {
    const filterKey = keys(value)[0]
    if (isEmpty(value?.[filterKey])) {
      const removeFilterKey = omit(filters, filterKey)
      setFilters({ ...removeFilterKey })
    } else {
      setFilters({ ...filters, ...value })
    }
  }

  const handelSortingChange = (value?: SortingFunctionType) => {
    if (!value?.sort_order) {
      const sortingKeys = keys(value)
      const filtersWithOutSorting = omit(filters, sortingKeys)
      setFilters({ ...filtersWithOutSorting })
    } else {
      setFilters({ ...filters, ...value })
    }
  }
  const handlePaginationChange = (value?: PaginationFunctionType) => {
    setFilters({ ...filters, ...value })
  }

  const { isLoading, isError, data } = useQuery<UsersDataType>({
    queryKey: ['users', filters],
    queryFn: () => apiClient.get(endpoints.USERS, filters),
    keepPreviousData: true,
  })
  const { meta: paginationData, data: users } = data || {}

  return {
    isLoading,
    isError,
    users,
    paginationData,
    handelFilterChange,
    handelSortingChange,
    handlePaginationChange,
  }
}

export const useFetchUser = ({ userId }: { userId?: string }) => {
  const { isLoading, isError, data } = useQuery<UserDataType>({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get(`${endpoints.USERS}/${userId}`),
  })

  return {
    isLoading,
    isError,
    user: data?.data,
  }
}

export const useUpdateUser = ({ userId }: { userId?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateUser, isLoading } = useMutation({
    mutationKey: ['users', userId],
    mutationFn: async (payload: UserPostType) =>
      apiClient.put(`${endpoints.USERS}/${userId}`, {
        ...payload,
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['users', userId],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: UsersDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newAData = { ...previousData, ...data }
          return { data: newAData }
        }
      )
    },
  })

  return {
    updateUser,
    isLoading,
  }
}

export const useValidateUsers = () => {
  const formData = new FormData()
  const { mutateAsync: validateUsers, isLoading } = useMutation({
    mutationKey: ['csv'],
    mutationFn: async (file: File) => {
      formData.append('file', file, 'file.csv')
      return apiClient.post(endpoints.VALIDATE_CSV, formData)
    },
  })

  return {
    validateUsers,
    isLoading,
  }
}

export const useUploadUsers = () => {
  const formData = new FormData()
  const {
    mutateAsync: uploadUsers,
    isLoading,
    error,
  } = useMutation({
    mutationKey: ['csv'],
    mutationFn: async (file: File) => {
      formData.append('file', file, 'file.csv')
      return apiClient.post(endpoints.IMPORT_CSV, formData)
    },
  })

  return {
    uploadUsers,
    isLoading,
    error,
  }
}
