import { RolePayload, RolesResponse } from 'types/roles'
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PrivilegesResponse } from 'types/privileges'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import { findIndex, filter, map } from 'lodash'
import useAuth from 'hooks/useAuth'

export const useRolesFetch = () => {
  const {
    isLoading,
    isError,
    data: rolesData,
  } = useQuery<RolesResponse>({
    queryKey: ['roles'],
    queryFn: () => apiClient.get(endpoints.ROLES),
  })

  const {
    isLoading: isLoadingPrivileges,
    isError: isPrivilegesError,
    data: privilegesData,
  } = useQuery<PrivilegesResponse>({
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

export const useUpdateRole = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateRole, isLoading } = useMutation({
    mutationKey: ['roles', id],
    mutationFn: (payload: RolePayload) =>
      apiClient.put(`${endpoints.ROLES}/${id}`, {
        // institution_id: userInfo?.tolkevarav?.selectedInstitution?.id,
        ...payload,
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['roles'], (oldData?: RolesResponse) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
        const roleIndex = findIndex(previousData, { id })
        const newArray = [...previousData]
        newArray[roleIndex] = data
        return { data: newArray }
      })
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
    mutationFn: (payload: RolePayload) =>
      apiClient.post(endpoints.ROLES, {
        institution_id: userInfo?.tolkevarav?.selectedInstitution?.id,
        ...payload,
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['roles'], (oldData?: RolesResponse) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
        const newData = [...previousData, data]
        return { data: newData }
      })
    },
  })

  return {
    createRole,
    isLoading,
  }
}
export const useDeleteRole = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutate: deleteRole, isLoading } = useMutation({
    mutationKey: ['roles', id],
    mutationFn: () => apiClient.delete(`${endpoints.ROLES}/${id}`),
    onSuccess: () => {
      queryClient.setQueryData(['roles'], (oldData?: RolesResponse) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
        const deletedData = filter(
          previousData,
          ({ id: previousId }) => previousId !== id
        )
        return { data: deletedData }
      })
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
