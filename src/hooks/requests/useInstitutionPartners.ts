import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import useFilters from 'hooks/useFilters'
import { ResponseMetaTypes } from 'types/collective'
import { InstitutionPartner, InstitutionPartnerFilters } from 'types/outsourceRequests'

interface ListResponse<T> {
  data: T[]
  meta?: ResponseMetaTypes
}

export const useFetchInstitutionPartners = (
  initialFilters?: InstitutionPartnerFilters,
  saveQueryParams?: boolean
) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<InstitutionPartnerFilters>(initialFilters, saveQueryParams)

  const { data, isLoading } = useQuery<ListResponse<InstitutionPartner>>({
    queryKey: ['institution-partners', filters],
    queryFn: () => apiClient.get(endpoints.INSTITUTION_PARTNERS, filters),
    keepPreviousData: true,
    staleTime: 60_000,
  })

  return {
    partners: data?.data ?? [],
    paginationData: data?.meta,
    filters: filters as InstitutionPartnerFilters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useCreateInstitutionPartners = (
  filters?: InstitutionPartnerFilters
) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createInstitutionPartners, isLoading } = useMutation({
    mutationKey: ['institution-partners-create', filters],
    mutationFn: async (payload: { data: { partner_institution_id: string }[] }) =>
      apiClient.post(endpoints.INSTITUTION_PARTNERS_BULK, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-partners'] })
      queryClient.invalidateQueries({
        queryKey: ['translation-order-institutions'],
      })
    },
  })

  return { createInstitutionPartners, isLoading }
}

export const useDeleteInstitutionPartners = (
  filters?: InstitutionPartnerFilters
) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteInstitutionPartners, isLoading } = useMutation({
    mutationKey: ['institution-partners-delete', filters],
    mutationFn: async (payload: { id: string[] }) =>
      apiClient.delete(endpoints.INSTITUTION_PARTNERS_BULK, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-partners'] })
      queryClient.invalidateQueries({
        queryKey: ['translation-order-institutions'],
      })
    },
  })

  return { deleteInstitutionPartners, isLoading }
}
