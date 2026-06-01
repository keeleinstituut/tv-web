import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import useFilters from 'hooks/useFilters'
import { ResponseMetaTypes } from 'types/collective'
import {
  AcceptOutsourceRequestPayload,
  CancelOutsourceRequestPayload,
  CreateOutsourceRequestPayload,
  DeclineOutsourceRequestPayload,
  OutsourceOffer,
  OutsourceOfferFilters,
  OutsourceRequest,
  OutsourceRequestFilters,
  SelectOutsourceOfferPayload,
} from 'types/outsourceRequests'

export { useFetchInstitutionPartners } from './useInstitutionPartners'

interface ListResponse<T> {
  data: T[]
  meta?: ResponseMetaTypes
}

interface SingleResponse<T> {
  data: T
}

export const useFetchOutsourceRequests = (
  initialFilters?: OutsourceRequestFilters,
  saveQueryParams?: boolean
) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<OutsourceRequestFilters>(initialFilters, saveQueryParams)

  const { search, ...serverFilters } = filters as OutsourceRequestFilters

  const { data, isLoading } = useQuery<ListResponse<OutsourceRequest>>({
    queryKey: ['outsource-requests', serverFilters],
    queryFn: () => apiClient.get(endpoints.OUTSOURCE_REQUESTS, serverFilters),
    keepPreviousData: true,
  })

  return {
    requests: data?.data ?? [],
    paginationData: data?.meta,
    filters: filters as OutsourceRequestFilters,
    searchValue: search ?? '',
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchOutsourceRequest = (id?: string) => {
  const { data, isLoading } = useQuery<SingleResponse<OutsourceRequest>>({
    enabled: !!id,
    queryKey: ['outsource-requests', id],
    queryFn: () => apiClient.get(endpoints.OUTSOURCE_REQUEST(id!)),
  })

  return { request: data?.data, isLoading }
}

export const useFetchAssignmentOutsourceRequests = (assignmentId?: string) => {
  const { data, isLoading } = useQuery<ListResponse<OutsourceRequest>>({
    enabled: !!assignmentId,
    queryKey: ['outsource-requests', 'assignment', assignmentId, 'OUTGOING'],
    queryFn: () =>
      apiClient.get(endpoints.OUTSOURCE_REQUESTS, {
        assignment_id: assignmentId,
        type: 'OUTGOING',
      }),
  })

  return { requests: data?.data ?? [], isLoading }
}

export const useCreateOutsourceRequest = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: createOutsourceRequest, isLoading } = useMutation({
    mutationFn: async (payload: CreateOutsourceRequestPayload) => {
      const { request_files, ...rest } = payload
      if (request_files && request_files.length > 0) {
        const form = new FormData()
        form.append('assignment_id', rest.assignment_id)
        form.append('mode', rest.mode)
        form.append('reaction_time_minutes', String(rest.reaction_time_minutes))
        rest.offers.forEach((offer, idx) => {
          form.append(`offers[${idx}][institution_id]`, offer.institution_id)
        })
        if (rest.special_instructions !== undefined) {
          form.append('special_instructions', rest.special_instructions)
        }
        if (rest.include_source_files !== undefined) {
          form.append('include_source_files', rest.include_source_files ? '1' : '0')
        }
        form.append('price_mode', rest.price_mode)
        if (rest.price !== undefined) {
          form.append('price', String(rest.price))
        }
        request_files.forEach((file, idx) => {
          form.append(`request_files[${idx}]`, file)
        })
        return apiClient.post(endpoints.OUTSOURCE_REQUESTS, form)
      }
      return apiClient.post(endpoints.OUTSOURCE_REQUESTS, rest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-requests'] })
    },
  })

  return { createOutsourceRequest, isLoading }
}

export const useAcceptOutsourceRequest = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: acceptOutsourceRequest, isLoading } = useMutation({
    mutationFn: async (payload?: AcceptOutsourceRequestPayload) => {
      if (!id) throw new Error('Outsource request id is required')
      return apiClient.post(
        endpoints.OUTSOURCE_REQUEST_ACCEPT(id),
        payload ?? {}
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-requests'] })
    },
  })

  return { acceptOutsourceRequest, isLoading }
}

export const useDeclineOutsourceRequest = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: declineOutsourceRequest, isLoading } = useMutation({
    mutationFn: async (payload: DeclineOutsourceRequestPayload) => {
      if (!id) throw new Error('Outsource request id is required')
      return apiClient.post(endpoints.OUTSOURCE_REQUEST_DECLINE(id), payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-requests'] })
    },
  })

  return { declineOutsourceRequest, isLoading }
}

export const useCancelOutsourceRequest = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: cancelOutsourceRequest, isLoading } = useMutation({
    mutationFn: async (payload: CancelOutsourceRequestPayload) => {
      if (!id) throw new Error('Outsource request id is required')
      return apiClient.post(endpoints.OUTSOURCE_REQUEST_CANCEL(id), payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-requests'] })
    },
  })

  return { cancelOutsourceRequest, isLoading }
}

export const useFetchOutsourceOffers = (
  initialFilters?: OutsourceOfferFilters,
  saveQueryParams?: boolean
) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<OutsourceOfferFilters>(initialFilters, saveQueryParams)

  const { data, isLoading } = useQuery<ListResponse<OutsourceOffer>>({
    queryKey: ['outsource-offers', filters],
    queryFn: () => apiClient.get(endpoints.OUTSOURCE_OFFERS, filters),
    keepPreviousData: true,
  })

  return {
    offers: data?.data ?? [],
    paginationData: data?.meta,
    filters: filters as OutsourceOfferFilters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchOutsourceOffer = (id?: string) => {
  const { data, isLoading } = useQuery<SingleResponse<OutsourceOffer>>({
    enabled: !!id,
    queryKey: ['outsource-offers', id],
    queryFn: () => apiClient.get(endpoints.OUTSOURCE_OFFER(id!)),
  })

  return { offer: data?.data, isLoading }
}

export const useAcceptOutsourceOffer = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: acceptOutsourceOffer, isLoading } = useMutation({
    mutationFn: async (payload?: AcceptOutsourceRequestPayload) => {
      if (!id) throw new Error('Outsource offer id is required')
      return apiClient.post(endpoints.OUTSOURCE_OFFER_ACCEPT(id), payload ?? {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-offers'] })
    },
  })

  return { acceptOutsourceOffer, isLoading }
}

export const useDeclineOutsourceOffer = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: declineOutsourceOffer, isLoading } = useMutation({
    mutationFn: async (payload: DeclineOutsourceRequestPayload) => {
      if (!id) throw new Error('Outsource offer id is required')
      return apiClient.post(endpoints.OUTSOURCE_OFFER_DECLINE(id), payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-offers'] })
    },
  })

  return { declineOutsourceOffer, isLoading }
}

export const useSelectOutsourceOffer = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: selectOutsourceOffer, isLoading } = useMutation({
    mutationFn: async (payload: SelectOutsourceOfferPayload) => {
      if (!id) throw new Error('Outsource request id is required')
      return apiClient.post(endpoints.OUTSOURCE_REQUEST_SELECT(id), payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outsource-requests'] })
    },
  })

  return { selectOutsourceOffer, isLoading }
}
