import { UserType } from 'types/users'
import { useQuery } from '@tanstack/react-query'
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
