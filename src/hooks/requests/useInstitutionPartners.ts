import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import useFilters from 'hooks/useFilters'
import { compact, filter, find, flatMap, includes, isEmpty, map } from 'lodash'
import { ResponseMetaTypes } from 'types/collective'
import {
  InstitutionPartner,
  InstitutionPartnerFilters,
  InstitutionPartnerPricesData,
  InstitutionPartnerPricesFilters,
  InstitutionPartnerResponse,
  UpdateInstitutionPartnerPayload,
} from 'types/outsourceRequests'
import { DataStateTypes } from 'components/organisms/modals/EditableListModal/EditableListModal'
import { PayloadItem, SkillPrice } from 'types/vendors'

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

export const useFetchInstitutionPartner = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<InstitutionPartnerResponse>({
    enabled: !!id,
    queryKey: ['institution-partners', id],
    queryFn: () => apiClient.get(`${endpoints.INSTITUTION_PARTNERS}/${id}`),
  })
  return { isLoading, isError, institutionPartner: data?.data }
}

export const useUpdateInstitutionPartner = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateInstitutionPartner, isLoading } = useMutation({
    mutationKey: ['institution-partners', id],
    mutationFn: async (payload: UpdateInstitutionPartnerPayload) =>
      apiClient.put(`${endpoints.INSTITUTION_PARTNERS}/${id}`, payload),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['institution-partners', id],
        (old?: InstitutionPartnerResponse) => {
          if (!old?.data) return old
          return { data: { ...old.data, ...data } }
        }
      )
    },
  })
  return { updateInstitutionPartner, isLoading }
}

export const useAllInstitutionPartnerPricesFetch = ({
  initialFilters,
  disabled,
  saveQueryParams,
}: {
  initialFilters?: InstitutionPartnerPricesFilters
  disabled?: boolean
  saveQueryParams?: boolean
}) => {
  const { filters, handlePaginationChange, handleFilterChange, handleSortingChange } =
    useFilters<InstitutionPartnerPricesFilters>(initialFilters, saveQueryParams)

  const { isLoading, isError, data } = useQuery<InstitutionPartnerPricesData>({
    queryKey: ['allInstitutionPartnerPrices', filters],
    queryFn: () => apiClient.get(endpoints.INSTITUTION_PARTNER_PRICES, filters),
    keepPreviousData: true,
    enabled: !disabled,
  })

  const { meta: paginationData, data: prices, aggregation: dates } = data || {}

  return {
    isLoading,
    isError,
    prices,
    dates,
    paginationData,
    filters: filters as InstitutionPartnerPricesFilters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useDeleteInstitutionPartnerPrices = (institution_partner_id?: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deletePrices, isLoading } = useMutation({
    mutationKey: ['institution-partner-prices', institution_partner_id],
    mutationFn: async (payload: { id: string[] }) =>
      apiClient.delete(endpoints.INSTITUTION_PARTNER_PRICES_BULK, { id: payload.id }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['allInstitutionPartnerPrices'] })
    },
  })
  return { deletePrices, isLoading }
}

const ipEditPromise = (data: SkillPrice[]): Promise<unknown> =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await apiClient.put(endpoints.INSTITUTION_PARTNER_PRICES_BULK, { data })
      resolve({ state: 'UPDATED', response })
    } catch (error) {
      reject({ state: 'UPDATED', error })
    }
  })

const ipDeletePromise = (id: (string | undefined)[]): Promise<unknown> =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await apiClient.delete(endpoints.INSTITUTION_PARTNER_PRICES_BULK, { id })
      resolve({ state: 'DELETED', response })
    } catch (error) {
      reject({ state: 'DELETED', error })
    }
  })

const ipCreatePromise = (data: SkillPrice[]): Promise<unknown> =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await apiClient.post(endpoints.INSTITUTION_PARTNER_PRICES_BULK, { data })
      resolve({ state: 'NEW', response })
    } catch (error) {
      reject({ state: 'NEW', error })
    }
  })

const ipParallelRequestsThatThrowOnPartialFailure = (
  payload: { data: PayloadItem[] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> =>
  new Promise(async (resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await Promise.allSettled(
      map(payload.data, ({ state, prices }) => {
        const ids = compact(map(prices, ({ id }) => id))
        if (state === DataStateTypes.DELETED) return ipDeletePromise(ids)
        if (state === DataStateTypes.NEW) return ipCreatePromise(prices)
        if (state === DataStateTypes.UPDATED) return ipEditPromise(prices)
      })
    )

    const fulfilled = compact(
      map(results, ({ status, value }, key) => {
        if (status === 'fulfilled' && value) return { key, value }
      })
    )

    const errors = compact(
      map(results, ({ status, reason }) => {
        if (status === 'rejected') return reason
      })
    )

    if (isEmpty(errors)) {
      resolve(results)
    } else {
      reject([...errors, { values: fulfilled }])
    }
  })

export const useParallelUpdateInstitutionPartnerPrices = ({
  institution_partner_id,
  filters,
}: {
  institution_partner_id?: string
  filters?: InstitutionPartnerPricesFilters
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: parallelUpdating, isLoading } = useMutation({
    mutationKey: ['institution-partner-prices', institution_partner_id],
    mutationFn: (payload: { data: PayloadItem[] }) =>
      ipParallelRequestsThatThrowOnPartialFailure(payload),
    onSuccess: (
      data: { value?: { response?: { data: SkillPrice[] } } }[],
      { data: payloadData }: { data: PayloadItem[] }
    ) => {
      const deletedPrices = find(payloadData, { state: DataStateTypes.DELETED })?.prices

      queryClient.setQueryData(
        ['allInstitutionPartnerPrices', filters],
        (oldData?: InstitutionPartnerPricesData) => {
          const { data: previousData, meta: oldMeta } = oldData || {}
          if (!previousData) return oldData
          const newValues = flatMap(data, 'value.response.data')
          const newPrices = filter(newValues, ({ id }) => !find(previousData, { id }))
          const updatedPrices = compact(
            map(previousData, (price) => {
              const updatedSkill = find(newValues, { id: price?.id })
              const wasSkillDeleted = deletedPrices && find(deletedPrices, { id: price?.id })
              if (wasSkillDeleted) return null
              if (updatedSkill) return { ...price, ...updatedSkill }
              return price
            })
          )
          return { data: [...updatedPrices, ...newPrices], meta: oldMeta }
        }
      )
    },
  })

  return { parallelUpdating, isLoading }
}
