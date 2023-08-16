import {
  VendorsDataType,
  GetVendorsPayload,
  UpdateVendorPayload,
  GetSkillsPayload,
  PricesDataType,
  UpdatePricesPayload,
} from 'types/vendors'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import useFilters from 'hooks/useFilters'

export const useVendorsFetch = (initialFilters?: GetVendorsPayload) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<GetVendorsPayload>()

  const { isLoading, isError, data } = useQuery<VendorsDataType>({
    queryKey: ['vendors', filters],
    queryFn: () => apiClient.get(endpoints.VENDORS, filters),
    keepPreviousData: true,
  })

  const { data: vendors, meta: paginationData } = data || {}

  return {
    vendors,
    isLoading,
    isError,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useUpdateVendor = (vendorId: string) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateVendor, isLoading } = useMutation({
    mutationKey: ['vendors', vendorId],
    mutationFn: async (payload: UpdateVendorPayload) => {
      return apiClient.put(`${endpoints.VENDORS}/${vendorId}`, {
        ...payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['vendors', vendorId],
        (oldData?: VendorsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    updateVendor,
    isLoading,
  }
}

export const useFetchSkills = () => {
  const { isLoading, isError, data } = useQuery<GetSkillsPayload>({
    queryKey: ['skills'],
    queryFn: () => apiClient.get(`${endpoints.SKILLS}`),
  })

  return {
    isLoading,
    isError,
    data: data?.data,
  }
}

export const useFetchPrices = (vendor_id: string | undefined) => {
  const { isLoading, isError, data } = useQuery<PricesDataType>({
    queryKey: ['prices', vendor_id],
    queryFn: () =>
      apiClient.get(
        `${endpoints.PRICES}?vendor_id=${vendor_id}&limit=1&order_by=created_at&order_direction=asc`
      ),
  })

  return {
    isLoading,
    isError,
    data: data?.data,
  }
}

export const useCreatePrices = (vendor_id: string | undefined) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createPrices, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: UpdatePricesPayload) => {
      return apiClient.post(endpoints.CREATE_PRICES, { data: payload.data })
    },

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['prices', vendor_id],
        // TODO: possibly will start storing all arrays as objects
        // if we do, then this should be rewritten
        (oldData?: PricesDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...oldData, ...data }
          return { data: newData }
        }
      )
    },
  })

  return {
    createPrices,
    isLoading,
  }
}
