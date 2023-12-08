import { GetPricesPayload } from 'types/price'
import {
  VendorsDataType,
  GetVendorsPayload,
  UpdateVendorPayload,
  PricesDataType,
  DeletePricesPayload,
  UpdatedPrices,
  GetSkillsPayload,
  VendorResponse,
  DeleteVendorsPayload,
  CreateVendorPayload,
  UpdatePricesPayload,
  Vendor,
} from 'types/vendors'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import useFilters from 'hooks/useFilters'
import { compact, filter, find, includes, isEmpty, map } from 'lodash'
import { UsersDataType } from 'types/users'

export const useVendorsFetch = (initialFilters?: GetVendorsPayload) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<GetVendorsPayload>(initialFilters)

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
    filters,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useUpdateVendor = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updateVendor, isLoading } = useMutation({
    mutationKey: ['vendors', id],
    mutationFn: async (payload: UpdateVendorPayload) => {
      return apiClient.put(`${endpoints.VENDORS}/${id}`, {
        ...payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['vendors', id], (oldData?: VendorsDataType) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
        const newData = { ...previousData, ...data }
        return { data: newData }
      })
    },
  })

  return {
    updateVendor,
    isLoading,
  }
}

export const useCreateVendors = (vendorFilters?: GetVendorsPayload) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createVendor, isLoading } = useMutation({
    mutationKey: ['vendors', vendorFilters],
    mutationFn: async (payload: CreateVendorPayload) => {
      return apiClient.post(endpoints.VENDORS_BULK, {
        data: payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['vendors', vendorFilters],
        (oldData?: VendorsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = { ...previousData, ...data }
          return { ...oldData, data: newData }
        }
      )
      queryClient.setQueryData(
        ['translationUsers'],
        (oldData?: UsersDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = map(previousData, (user) => {
            const vendor = find(data, { institution_user_id: user?.id })
            return { ...user, ...(!!vendor && { vendor: vendor }) }
          })
          return { data: newData }
        }
      )
    },
  })

  return {
    createVendor,
    isLoading,
  }
}

export const useDeleteVendors = (vendorFilters?: GetVendorsPayload) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteVendors, isLoading } = useMutation({
    mutationKey: ['vendors', vendorFilters],
    mutationFn: async (payload: DeleteVendorsPayload) => {
      return apiClient.delete(endpoints.VENDORS_BULK, {
        id: payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['vendors', vendorFilters],
        (oldData?: VendorsDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const vendorIds = map(data, 'id')
          const newData = filter(
            previousData,
            ({ id }) => !includes(vendorIds, id)
          )
          return { ...oldData, data: newData }
        }
      )
      queryClient.setQueryData(
        ['translationUsers'],
        (oldData?: UsersDataType) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = map(previousData, (user) => {
            const deleteVendor = find(data, { institution_user_id: user?.id })
            return { ...user, ...(!!deleteVendor ? { vendor: null } : {}) }
          })
          return { data: newData }
        }
      )
    },
  })

  return {
    deleteVendors,
    isLoading,
  }
}

export const useVendorFetch = ({ id }: { id?: string }) => {
  const { isLoading, isError, data } = useQuery<VendorResponse>({
    enabled: !!id,
    queryKey: ['vendors', id],
    queryFn: () => apiClient.get(`${endpoints.VENDORS}/${id}`),
  })
  return {
    isLoading,
    isError,
    vendor: data?.data,
  }
}

export const useVendorCache = (id?: string): Vendor | undefined => {
  const queryClient = useQueryClient()
  const vendorCache: { data: Vendor } | undefined = queryClient.getQueryData([
    'vendors',
    id,
  ])
  const vendor = vendorCache?.data

  return vendor
}

export const useFetchSkills = () => {
  const { isLoading, isError, data } = useQuery<GetSkillsPayload>({
    queryKey: ['skills'],
    queryFn: () => apiClient.get(`${endpoints.SKILLS}`),
  })

  const { data: skills } = data || {}

  const skillsFilters = map(skills, ({ id, name }) => {
    return { value: id, label: name }
  })

  return {
    isLoading,
    isError,
    skills,
    skillsFilters,
  }
}

export const useAllPricesFetch = (initialFilters?: GetPricesPayload) => {
  const {
    filters,
    handlePaginationChange,
    handleFilterChange,
    handleSortingChange,
  } = useFilters<GetPricesPayload>(initialFilters)

  const { isLoading, isError, data } = useQuery<PricesDataType>({
    queryKey: ['allPrices', filters],
    queryFn: () => apiClient.get(endpoints.PRICES, filters),
    keepPreviousData: true,
  })

  const { meta: paginationData, data: prices } = data || {}

  return {
    isLoading,
    isError,
    prices,
    paginationData,
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export const useDeletePrices = (vendor_id: string | undefined) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deletePrices, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: DeletePricesPayload) =>
      apiClient.delete(endpoints.EDIT_PRICES, { id: payload.id }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['prices', vendor_id],
        (oldData?: UpdatedPrices) => {
          const { data: previousData } = oldData || {}

          const deletedPricesArray = map(data, ({ id }) => id)
          const filteredData = filter(
            previousData,
            (item) => !includes(deletedPricesArray, item.id)
          )
          return { data: filteredData }
        }
      )
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
    },
  })

  return {
    deletePrices,
    isLoading,
  }
}

const requestsPromiseThatThrowsAnErrorWhenSomeRequestsFailed = (
  payload: UpdatePricesPayload
) =>
  new Promise(async (resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await Promise.allSettled(
      map(payload.data, ({ state, prices }) => {
        const deletedPricesIds = map(prices, ({ id }) => id)

        if (state === 'DELETED') {
          return apiClient.delete(endpoints.EDIT_PRICES, {
            id: deletedPricesIds,
          })
        }
        if (state === 'NEW') {
          return apiClient.post(endpoints.EDIT_PRICES, { data: prices })
        }
        if (state === 'UPDATED') {
          return apiClient.put(endpoints.EDIT_PRICES, { data: prices })
        }
      })
    )

    const fulfilled = compact(
      map(results, ({ status, value }, key) => {
        if (status === 'fulfilled') {
          if (value) {
            return {
              key,
              value,
            }
          }
        }
      })
    )

    const errors = compact(
      map(results, ({ status, reason }) => {
        if (status === 'rejected') {
          const { message } = reason || {}
          const error = {
            errors: reason.errors,
            message: message || '',
          }
          return error
        }
      })
    )

    if (isEmpty(errors)) {
      resolve(results)
    } else {
      reject([...errors, { values: fulfilled }])
    }
  })

export const useParallelMutationDepartment = (
  vendor_id: string | undefined
) => {
  const queryClient = useQueryClient()
  const { mutateAsync: parallelUpdating, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: UpdatePricesPayload) =>
      requestsPromiseThatThrowsAnErrorWhenSomeRequestsFailed(payload),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
    },
  })

  return { parallelUpdating, isLoading }
}
