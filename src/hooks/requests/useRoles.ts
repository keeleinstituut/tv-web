import { RoleType, RolesDataTypes } from 'types/roles'
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PrivilegeDataType } from 'types/privileges'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { findIndex, filter, map } from 'lodash'
import useAuth from 'hooks/useAuth'

export const useRolesFetch = () => {
  const {
    isLoading,
    isError,
    data: rolesData,
  } = useQuery<RolesDataTypes>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get(endpoints.ROLES),
  })

  const {
    isLoading: isLoadingPrivileges,
    isError: isPrivilegesError,
    data: privilegesData,
  } = useQuery<PrivilegeDataType>({
    queryKey: ['privileges'],
    queryFn: () => apiClient.get(endpoints.PRIVILEGES),
  })

  const { data: existingRoles } = rolesData || {}
  const { data: allPrivileges } = privilegesData || {}

  const rolesFilters = map(existingRoles, ({ id, name }) => {
    return { value: id, label: name }
  })

  return {
    existingRoles,
    allPrivileges,
    isLoading: isLoading || isLoadingPrivileges,
    isError: isError || isPrivilegesError,
    rolesFilters,
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
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['roles'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: RolesDataTypes) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const roleIndex = findIndex(previousData, { id: roleId })
          const newArray = [...previousData]
          newArray[roleIndex] = data
          return { data: newArray }
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
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['roles'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: RolesDataTypes) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, data]
          return { data: newData }
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
    onSuccess: () => {
      queryClient.setQueryData(
        ['roles'],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: RolesDataTypes) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const deletedData = filter(previousData, ({ id }) => id !== roleId)
          return { data: deletedData }
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
