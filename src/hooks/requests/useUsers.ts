import { UserPostType, UserType } from 'types/users'
import { useMutation, useQuery } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'

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
