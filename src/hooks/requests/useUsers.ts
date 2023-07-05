import {
  UserPostType,
  UserType,
  UserPayloadType,
  UserDataType,
  FilterFunctionType,
  SortingFunctionType,
} from 'types/users'
import { useMutation, useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { useState } from 'react'

export const useFetchUsers = () => {
  const [filters, setFilters] = useState<UserPayloadType>({})

  const handelFilterChange = (value?: FilterFunctionType) => {
    setFilters({ ...filters, ...value })
  }
  const handelSortingChange = (value?: SortingFunctionType) => {
    console.log('value', value)
    setFilters({ ...filters, ...value })
  }

  const { isLoading, isError, data } = useQuery<UserDataType>({
    queryKey: ['users', filters],
    queryFn: () => apiClient.get(endpoints.USERS, filters),
  })
  const { meta, data: users } = data || {}
  console.log('data', data)
  return {
    isLoading,
    isError,
    users,
    handelFilterChange,
    handelSortingChange,
  }
}

export const useFetchUser = ({ userId }: { userId?: string }) => {
  const {
    isLoading,
    isError,
    data: user,
  } = useQuery<UserType>({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get(`${endpoints.USERS}/${userId}`),
  })

  return {
    isLoading,
    isError,
    user,
  }
}

export const useUpdateUser = ({ userId }: { userId?: string }) => {
  const { mutateAsync: updateUser, isLoading } = useMutation({
    mutationKey: ['users', userId],
    mutationFn: (payload: UserPostType) =>
      apiClient.put(`${endpoints.USERS}/${userId}`, {
        ...payload,
      }),
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
