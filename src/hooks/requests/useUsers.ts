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
import { downloadFile } from 'helpers'
import useFilters from 'hooks/useFilters'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const useFetchUsers = (
  initialFilters?: UserPayloadType,
  useTranslationService?: boolean
) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<UserPayloadType>(initialFilters)

  const { isLoading, isError, isFetching, data } = useQuery<UsersDataType>({
    queryKey: [useTranslationService ? 'translationUsers' : 'users', filters],
    queryFn: () =>
      apiClient.get(
        useTranslationService ? endpoints.TRANSLATION_USERS : endpoints.USERS,
        filters
      ),
    keepPreviousData: true,
  })
  const { meta: paginationData, data: users } = data || {}

  return {
    isLoading,
    isError,
    users,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    isFetching,
  }
}

export const useFetchTranslationUsers = (initialFilters?: UserPayloadType) =>
  useFetchUsers(initialFilters, true)

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
    mutationFn: async (payload: UserPostType) => {
      return apiClient.put(`${endpoints.USERS}/${userId}`, {
        ...payload,
      })
    },
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

export const useDownloadUsers = () => {
  const { mutateAsync: downloadCSV, isLoading } = useMutation({
    mutationKey: ['csv'],
    mutationFn: () => apiClient.get(endpoints.EXPORT_CSV),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'users.csv',
        fileType: 'text/csv',
      })
    },
  })
  return {
    isLoading,
    downloadCSV,
  }
}

export const useArchiveUser = ({
  institution_user_id,
}: {
  institution_user_id?: string
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: archiveUser, isLoading } = useMutation({
    mutationKey: ['users', institution_user_id],
    mutationFn: async () =>
      apiClient.post(endpoints.ARCHIVE_USER, {
        institution_user_id,
      }),

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
      const { deactivation_date: date } = payload
      const formattedDeactivationDate = date
        ? dayjs(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
        : null
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
    mutationFn: async (payload: UserStatusType) =>
      apiClient.post(endpoints.ACTIVATE_USER, {
        ...payload,
        institution_user_id,
      }),

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
