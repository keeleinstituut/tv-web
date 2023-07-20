import {
  UserPostType,
  UsersDataType,
  UserPayloadType,
  UserDataType,
  UserStatusType,
} from 'types/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import useFilters from 'hooks/useFilters'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const useFetchUsers = () => {
  const {
    filters,
    handelFilterChange,
    handelSortingChange,
    handlePaginationChange,
  } = useFilters<UserPayloadType>()

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
          const newData = { ...previousData, ...data }
          return { data: newData }
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

export const useDeactivateUser = ({
  institution_user_id,
}: {
  institution_user_id?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deactivateUser, isLoading } = useMutation({
    mutationKey: ['users', institution_user_id],
    mutationFn: async (payload: UserStatusType) => {
      const { deactivation_date: date, institution_user_id } = payload
      const formattedDeactivationDate = dayjs(date, 'DD/MM/YYYY').format(
        'YYYY-MM-DD'
      )
      return apiClient.post(endpoints.DEACTIVATE_USER, {
        institution_user_id: institution_user_id,
        deactivation_date: formattedDeactivationDate,
      })
    },

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['users', institution_user_id],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: UsersDataType) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData
          const newData = { ...oldData, ...data }

          return { data: newData }
        }
      )
    },
  })

  return {
    deactivateUser,
    isLoading,
  }
}

export const useActivateUser = ({
  institution_user_id,
}: {
  institution_user_id?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: activateUser, isLoading } = useMutation({
    mutationKey: ['users', institution_user_id],
    mutationFn: async (payload: UserStatusType) => {
      return apiClient.post(endpoints.ACTIVATE_USER, {
        ...payload,
      })
    },

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['users', institution_user_id],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: UsersDataType) => {
          const { data: previousData } = oldData || {}

          if (!previousData) return oldData
          const newData = { ...oldData, ...data }

          return { data: newData }
        }
      )
    },
  })

  return {
    activateUser,
    isLoading,
  }
}
