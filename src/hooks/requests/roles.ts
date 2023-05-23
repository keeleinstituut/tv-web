import { RoleType } from 'types/roles'
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PrivilegeType } from 'types/privileges'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { findIndex, filter } from 'lodash'
import useAuth from 'hooks/useAuth'

export const useRolesFetch = () => {
  const {
    isLoading,
    isError,
    data: existingRoles,
  } = useQuery<RoleType[]>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get(endpoints.ROLES),
  })
  const {
    isLoading: isLoadingPrivileges,
    isError: isPrivilegesError,
    data: allPrivileges,
  } = useQuery<PrivilegeType[]>({
    queryKey: ['privileges'],
    queryFn: () => apiClient.get(endpoints.PRIVILEGES),
  })

  return {
    existingRoles,
    allPrivileges,
    loading: isLoading || isLoadingPrivileges,
    isError: isError || isPrivilegesError,
  }
}

export const useUpdateRole = ({ roleId }: { roleId?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateRole, isLoading } = useMutation({
    mutationKey: ['roles', roleId],
    mutationFn: (payload: RoleType) =>
      apiClient.put(`${endpoints.ROLES}/${roleId}`, {
        // institution_id: userInfo?.tolkevarav?.selectedInstitution?.id,
        ...payload,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['roles'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: RoleType[]) => {
          if (!oldData) return oldData
          const roleIndex = findIndex(oldData, { id: roleId })
          const newArray = [...oldData]
          newArray[roleIndex] = data
          return newArray
        }
      )
    },
  })

  return {
    updateRole,
    isLoading,
  }
}

export const useCreateRole = () => {
  const { userInfo } = useAuth()
  const queryClient = useQueryClient()
  const { mutateAsync: createRole, isLoading } = useMutation({
    mutationKey: ['roles'],
    mutationFn: (payload: RoleType) =>
      apiClient.post(endpoints.ROLES, {
        institution_id: userInfo?.tolkevarav?.selectedInstitution?.id,
        ...payload,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['roles'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: RoleType[]) => {
          if (!oldData) return oldData
          return [...oldData, data]
        }
      )
    },
  })

  return {
    createRole,
    isLoading,
  }
}

export const useDeleteRole = ({ roleId }: { roleId?: string }) => {
  const queryClient = useQueryClient()
  const { mutate: deleteRole, isLoading } = useMutation({
    mutationKey: ['roles', roleId],
    mutationFn: () => apiClient.delete(`${endpoints.ROLES}/${roleId}`),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['roles'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: RoleType[]) => {
          if (!oldData) return oldData
          return filter(oldData, ({ id }) => id !== roleId)
        }
      )
    },
  })

  const wrappedDeleteRole = useCallback(() => {
    deleteRole()
  }, [deleteRole])

  return {
    deleteRole: wrappedDeleteRole,
    isLoading,
  }
}
