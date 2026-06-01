import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import useFilters from 'hooks/useFilters'
import { ResponseMetaTypes } from 'types/collective'
import { Institution } from 'types/outsourceRequests'
import {
  InstitutionDataType,
  InstitutionDiscountsDataType,
  InstitutionPostType,
  InstitutionVacationsDataType,
  InstitutionsDataType,
  InstitutionUserVacationResponse,
  InstitutionUserVacationsPostType,
  InstitutionVacationsPostType,
  InstitutionMainLanguage,
  SyncMainLanguagesPayload,
} from 'types/institutions'
import { DiscountPercentages } from 'types/vendors'

export const useInstitutionsFetch = () => {
  const { isLoading, isError, data } = useQuery<InstitutionsDataType>({
    queryKey: ['institutions'],
    queryFn: () => apiClient.get(endpoints.INSTITUTIONS),
  })

  const { data: institutions } = data || {}

  return {
    institutions,
    isLoading: isLoading,
    isError: isError,
  }
}

export const useInstitutionFetch = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<InstitutionDataType>({
    enabled: !!id,
    queryKey: ['institutions', id],
    queryFn: () => apiClient.get(`${endpoints.INSTITUTIONS}/${id}`),
  })
  const { data: institution } = data || {}

  return {
    institution,
    isLoading: isLoading,
    isError: isError,
  }
}

export const useInstitutionUpdate = ({ id }: { id?: string | undefined }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateInstitution, isLoading } = useMutation({
    mutationKey: ['institutions', id],
    mutationFn: (payload: InstitutionPostType) =>
      apiClient.put(`${endpoints.INSTITUTIONS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['institutions', id],
        (oldData?: InstitutionsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({ queryKey: ['institutions'], type: 'active' })
    },
  })

  return {
    updateInstitution,
    isLoading,
  }
}

export const useFetchInstitutionDiscounts = () => {
  const { isLoading, isError, data } = useQuery<InstitutionDiscountsDataType>({
    queryKey: ['institution-discounts'],
    queryFn: () => apiClient.get(endpoints.DISCOUNTS),
  })
  const { data: institutionDiscounts } = data || {}

  return {
    institutionDiscounts,
    isLoading,
    isError,
  }
}

export const useUpdateInstitutionDiscounts = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateInstitutionDiscounts, isLoading } = useMutation({
    mutationKey: ['institution-discounts'],
    mutationFn: (payload: DiscountPercentages) =>
      apiClient.put(endpoints.DISCOUNTS, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['institution-discounts'],
        (oldData?: InstitutionDiscountsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
      queryClient.refetchQueries({
        queryKey: ['institution-discounts'],
        type: 'active',
      })
    },
  })
  return {
    updateInstitutionDiscounts,
    isLoading,
  }
}

export const useInstitutionVacationsFetch = () => {
  const { isLoading, isError, data } = useQuery<InstitutionVacationsDataType>({
    queryKey: ['institution-vacations'],
    queryFn: () => apiClient.get(`${endpoints.INSTITUTION_VACATIONS}`),
  })

  const { data: institutionVacations } = data || {}

  return {
    institutionVacations,
    isLoading,
    isError,
  }
}

export const useInstitutionVacationsUpdate = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateInstitutionVacations, isLoading } = useMutation({
    mutationKey: ['institution-vacations'],
    mutationFn: (payload: InstitutionVacationsPostType) =>
      apiClient.post(`${endpoints.INSTITUTION_VACATIONS}/sync`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['institution-vacations'],
        (oldData?: InstitutionVacationsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    updateInstitutionVacations,
    isLoading,
  }
}

export const useInstitutionUserVacationsFetch = ({
  id,
}: {
  id?: string | undefined
}) => {
  const { isLoading, isError, data } =
    useQuery<InstitutionUserVacationResponse>({
      enabled: !!id,
      queryKey: ['institution-user-vacations', id],
      queryFn: () =>
        apiClient.get(`${endpoints.INSTITUTION_USER_VACATIONS}/${id}`),
    })

  const { data: institutionUserVacations } = data || {}

  return {
    userVacations: institutionUserVacations,
    isLoading: isLoading,
    isError: isError,
  }
}

export const useInstitutionUserVacationsUpdate = ({
  id,
}: {
  id?: string | undefined
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateInstitutionUserVacations, isLoading } =
    useMutation({
      mutationKey: ['institution-user-vacations', id],
      mutationFn: (payload: InstitutionUserVacationsPostType) =>
        apiClient.post(`${endpoints.INSTITUTION_USER_VACATIONS}/sync`, payload),
      onSuccess: ({ data }) => {
        queryClient.setQueryData(
          ['institution-user-vacations', id],
          (oldData?: InstitutionVacationsDataType) => {
            const { data: previousData } = oldData || {}
            if (!previousData) return oldData
            const newData = { ...data }
            return { data: newData }
          }
        )
      },
    })

  return {
    updateInstitutionUserVacations,
    isLoading,
  }
}

export const useFetchInstitutionMainLanguages = () => {
  const { isLoading, data } = useQuery<{ data: InstitutionMainLanguage[] }>({
    queryKey: ['institution-main-languages'],
    queryFn: () => apiClient.get(endpoints.INSTITUTION_MAIN_LANGUAGES),
  })
  return { mainLanguages: data?.data ?? [], isLoading }
}

export const useSyncInstitutionMainLanguages = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: syncMainLanguages, isLoading } = useMutation({
    mutationFn: (payload: SyncMainLanguagesPayload) =>
      apiClient.post(endpoints.INSTITUTION_MAIN_LANGUAGES, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['institution-main-languages'], { data })
      queryClient.invalidateQueries({ queryKey: ['calendar-languages'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-day'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-week'] })
      queryClient.invalidateQueries({ queryKey: ['calendar-month'] })
    },
  })
  return { syncMainLanguages, isLoading }
}

interface OutsourceInstitutionsFilters {
  name?: string
  per_page?: number
  page?: number
  sort_by?: 'name'
  sort_order?: 'asc' | 'desc'
}

interface ListResponse<T> {
  data: T[]
  meta?: ResponseMetaTypes
}

export const useTranslationOrderInstitutions = (
  initialFilters?: OutsourceInstitutionsFilters,
  saveQueryParams?: boolean
) => {
  const { filters, handleFilterChange, handlePaginationChange } =
    useFilters<OutsourceInstitutionsFilters>(initialFilters, saveQueryParams)

  const { data, isLoading } = useQuery<ListResponse<Institution>>({
    queryKey: ['translation-order-institutions', filters],
    queryFn: () =>
      apiClient.get(endpoints.TRANSLATION_ORDER_INSTITUTIONS, filters),
    keepPreviousData: true,
  })

  return {
    institutions: data?.data ?? [],
    paginationData: data?.meta,
    filters: filters as OutsourceInstitutionsFilters,
    isLoading,
    handleFilterChange,
    handlePaginationChange,
  }
}
