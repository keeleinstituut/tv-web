import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CancelProjectRequestPayload,
  CreateProjectRequestPayload,
  DeclineProjectRequestPayload,
  ExternalVendorInstitution,
  ProjectRequest,
  ProjectRequestFilters,
  SelectWinningVendorPayload,
} from 'types/projectRequests'
import { ResponseMetaTypes } from 'types/collective'
import useFilters from 'hooks/useFilters'
import {
  MOCK_EXTERNAL_VENDOR_INSTITUTIONS,
  MOCK_PROJECT_REQUESTS,
} from './mock/projectRequests.mock'

// BE is not ready yet — all hooks return mock data.
// When BE lands, replace the queryFn / mutationFn bodies with apiClient calls
// (endpoints are already defined in src/api/endpoints.ts).
const USE_MOCK = true

const delay = <T>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

interface ProjectRequestsResponse {
  data: ProjectRequest[]
  meta: ResponseMetaTypes
}

const mockPaginate = (
  filters: ProjectRequestFilters
): ProjectRequestsResponse => {
  const { status, search, page = 1, per_page = 10 } = filters
  const loweredSearch = (search || '').trim().toLowerCase()

  const filtered = MOCK_PROJECT_REQUESTS.filter((r) => {
    if (status && r.status !== status) return false
    if (!loweredSearch) return true
    return [
      r.project_ext_id,
      r.requestor_institution_name,
      r.project_type_name,
      r.language_pair,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(loweredSearch))
  })

  const total = filtered.length
  const startIdx = (page - 1) * per_page
  const pageData = filtered.slice(startIdx, startIdx + per_page)

  return {
    data: pageData,
    meta: {
      current_page: page,
      per_page,
      total,
      last_page: Math.max(1, Math.ceil(total / per_page)),
      from: total ? startIdx + 1 : 0,
      to: Math.min(startIdx + per_page, total),
    },
  }
}

export const useFetchExternalVendorInstitutions = () => {
  const { data, isLoading } = useQuery<ExternalVendorInstitution[]>({
    queryKey: ['external-vendor-institutions'],
    queryFn: async () => {
      if (USE_MOCK) return delay(MOCK_EXTERNAL_VENDOR_INSTITUTIONS)
      throw new Error('Not implemented')
    },
    staleTime: Infinity,
  })

  return { institutions: data ?? [], isLoading }
}

export const useFetchProjectRequests = (
  initialFilters?: ProjectRequestFilters,
  saveQueryParams?: boolean
) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<ProjectRequestFilters>(initialFilters, saveQueryParams)

  const { data, isLoading } = useQuery<ProjectRequestsResponse>({
    queryKey: ['project-requests', filters],
    queryFn: async () => {
      if (USE_MOCK) return delay(mockPaginate(filters as ProjectRequestFilters))
      throw new Error('Not implemented')
    },
    keepPreviousData: true,
  })

  return {
    requests: data?.data ?? [],
    paginationData: data?.meta,
    filters: filters as ProjectRequestFilters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useFetchProjectRequest = (id?: string) => {
  const { data, isLoading } = useQuery<ProjectRequest | undefined>({
    queryKey: ['project-requests', id],
    queryFn: async () => {
      if (USE_MOCK) return delay(MOCK_PROJECT_REQUESTS.find((r) => r.id === id))
      throw new Error('Not implemented')
    },
    enabled: !!id,
  })

  return { request: data, isLoading }
}

export const useFetchAssignmentProjectRequests = (assignmentId?: string) => {
  const { data, isLoading } = useQuery<ProjectRequest[]>({
    queryKey: ['project-requests', 'assignment', assignmentId],
    queryFn: async () => {
      if (USE_MOCK)
        return delay(
          MOCK_PROJECT_REQUESTS.filter((r) => r.assignment_id === assignmentId)
        )
      throw new Error('Not implemented')
    },
    enabled: !!assignmentId,
  })

  return { requests: data ?? [], isLoading }
}

export const useCreateProjectRequest = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: createProjectRequest, isLoading } = useMutation({
    mutationFn: async (payload: CreateProjectRequestPayload) => {
      if (USE_MOCK) return delay({ data: { ...payload, id: 'mock-new' } })
      throw new Error('Not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-requests'] })
    },
  })

  return { createProjectRequest, isLoading }
}

export const useAcceptProjectRequest = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: acceptProjectRequest, isLoading } = useMutation({
    mutationFn: async () => {
      if (USE_MOCK) return delay({ data: { id } })
      throw new Error('Not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-requests'] })
    },
  })

  return { acceptProjectRequest, isLoading }
}

export const useDeclineProjectRequest = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: declineProjectRequest, isLoading } = useMutation({
    mutationFn: async (payload: DeclineProjectRequestPayload) => {
      if (USE_MOCK) return delay({ data: { id, ...payload } })
      throw new Error('Not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-requests'] })
    },
  })

  return { declineProjectRequest, isLoading }
}

export const useCancelProjectRequest = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: cancelProjectRequest, isLoading } = useMutation({
    mutationFn: async (payload: CancelProjectRequestPayload) => {
      if (USE_MOCK) return delay({ data: { id, ...payload } })
      throw new Error('Not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-requests'] })
    },
  })

  return { cancelProjectRequest, isLoading }
}

export const useSelectWinningVendor = (id: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: selectWinningVendor, isLoading } = useMutation({
    mutationFn: async (payload: SelectWinningVendorPayload) => {
      if (USE_MOCK) return delay({ data: { id, ...payload } })
      throw new Error('Not implemented')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-requests'] })
    },
  })

  return { selectWinningVendor, isLoading }
}
