import { UserPostType, UserType } from 'types/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { useCallback } from 'react'

export const useFetchUsers = () => {
  const {
    isLoading,
    isError,
    data: users,
  } = useQuery<UserType[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get(endpoints.USERS),
  })

  return {
    isLoading,
    isError,
    users,
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

export const useArchiveUser = ({ userId }: { userId?: string }) => {
  const queryClient = useQueryClient()
  const { mutate: archiveUser, isLoading } = useMutation({
    mutationKey: ['users', userId],
    mutationFn: () => apiClient.post(`${endpoints.USERS}/${userId}`),
    // onSuccess: () => {
    //   queryClient.setQueryData(['roles'], (oldData?: RoleType[]) => {
    //     if (!oldData) return oldData
    //     return filter(oldData, ({ id }) => id !== userId)
    //   })
    // },
  })

  const wrappedDeleteRole = useCallback(() => {
    archiveUser()
  }, [archiveUser])

  return {
    archiveUser: wrappedDeleteRole,
    isLoading,
  }
}
