import {
  UserPostType,
  UsersDataType,
  UserPayloadType,
  UserDataType,
} from 'types/users'
import { FilterFunctionType, SortingFunctionType } from 'types/collective'
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
    setFilters({ ...filters, ...value })
  }

  const { isLoading, isError, data } = useQuery<UsersDataType>({
    queryKey: ['users', filters],
    queryFn: () => apiClient.get(endpoints.USERS, filters),
  })
  const { data: users } = data || {}
  return {
    isLoading,
    isError,
    users,
    handelFilterChange,
    handelSortingChange,
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

export const useArchiveUser = ({ userId }: { userId?: string }) => {
  const { mutate: archiveUser, isLoading } = useMutation({
    mutationKey: ['users', userId],
    mutationFn: () => {
      return apiClient.post(endpoints.ARCHIVE_USER, {
        institution_user_id: userId,
      })
    },
  })

  return {
    archiveUser,
    isLoading,
  }
}

export const useDeactivateUser = () => {
  const { mutate: deactivateUser, isLoading } = useMutation({
    mutationKey: ['users'],
    mutationFn: (values: {
      user_deactivation_date: string
      userId: string
    }) => {
      const { user_deactivation_date: date, userId } = values

      const splittedDeactivationDate = date?.split('/')

      const formattedDeactivationDate =
        splittedDeactivationDate?.[2] +
        '-' +
        splittedDeactivationDate?.[1] +
        '-' +
        splittedDeactivationDate?.[0]

      return apiClient.post(endpoints.DEACTIVATE_USER, {
        institution_user_id: userId,
        deactivation_date: formattedDeactivationDate,
      })
    },
  })

  return {
    deactivateUser,
    isLoading,
  }
}
