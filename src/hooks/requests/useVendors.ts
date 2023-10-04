import {
  VendorsDataType,
  GetVendorsPayload,
  UpdateVendorPayload,
  PricesDataType,
  UpdatePricesPayload,
  GetPricesPayload,
  CreatePricesPayload,
  DeletePricesPayload,
  UpdatedPrices,
  GetSkillsPayload,
  VendorResponse,
  DeleteVendorsPayload,
  CreateVendorPayload,
} from 'types/vendors'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import useFilters from 'hooks/useFilters'
import { compact, filter, find, includes, isEmpty, map } from 'lodash'

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

export const useCreateVendors = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: createVendor, isLoading } = useMutation({
    mutationKey: ['vendors'],
    mutationFn: async (payload: CreateVendorPayload) => {
      return apiClient.post(endpoints.VENDORS_BULK, {
        data: payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['vendors'], (oldData?: VendorsDataType) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
        const newData = { ...previousData, ...data }
        return { data: newData }
      })
      queryClient.refetchQueries({
        queryKey: ['translationUsers'],
        type: 'active',
      })
    },
  })

  return {
    createVendor,
    isLoading,
  }
}

export const useDeleteVendors = () => {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteVendors, isLoading } = useMutation({
    mutationKey: ['vendors'],
    mutationFn: async (payload: DeleteVendorsPayload) => {
      return apiClient.delete(endpoints.VENDORS_BULK, {
        id: payload,
      })
    },
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['vendors'], (oldData?: VendorsDataType) => {
        const { data: previousData } = oldData || {}
        if (!previousData) return oldData
        const newData = { ...previousData, ...data }
        return { data: newData }
      })
      queryClient.refetchQueries({
        queryKey: ['translationUsers'],
        type: 'active',
      })
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

export const useCreatePrices = (vendor_id: string | undefined) => {
  const queryClient = useQueryClient()
  const { mutateAsync: createPrices, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: CreatePricesPayload) => {
      console.log('payload', payload)
      return apiClient.post(endpoints.EDIT_PRICES, { data: payload.data })
    },

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['prices', vendor_id],
        (oldData?: UpdatedPrices) => {
          const { data: previousData } = oldData || {}
          if (!previousData) return oldData
          const newData = [...previousData, ...data]

          return { data: newData }
        }
      )
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
    },
  })

  return {
    createPrices,
    isLoading,
  }
}

export const useUpdatePrices = (vendor_id: string | undefined) => {
  const queryClient = useQueryClient()
  const { mutateAsync: updatePrices, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: UpdatePricesPayload) =>
      apiClient.put(endpoints.EDIT_PRICES, { data: payload.data }),

    onSuccess: ({ data }) => {
      queryClient.setQueryData(
        ['prices', vendor_id],
        (oldData?: UpdatedPrices) => {
          const { data: previousData } = oldData || {}

          const newData = map(previousData, (item) => {
            const matchingItem = find(data, { id: item.id })
            return matchingItem || item
          })

          return { data: newData }
        }
      )
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
    },
  })

  return {
    updatePrices,
    isLoading,
  }
}

export const useDeletePrices = (vendor_id: string | undefined) => {
  const queryClient = useQueryClient()
  const { mutateAsync: deletePrices, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: DeletePricesPayload) => {
      console.log('payload', payload)

      return apiClient.delete(endpoints.EDIT_PRICES, { id: payload.id })
    },

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

const requestsPromiseThatThrowsAnErrorWhenSomeRequestsFailed = (payload: any) =>
  new Promise(async (resolve, reject) => {
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
      map(results, ({ status, reason, value }, key) => {
        // console.log('status', status)
        // console.log('reason', reason)
        // console.log('value', value)
        // console.log('key', key)
        if (status === 'rejected') {
          const { message, errors: err } = reason || {}
          const name = `skillPrice.${key}`
          const error = {
            // errors: { [name]: err?.name || [] },
            errors: reason,
            message: message || '',
            name: key,
          }
          // return error
          return reason
        }
      })
    )

    if (isEmpty(errors)) {
      resolve(results)
    } else {
      // reject([...errors, { values: fulfilled }])
      reject(...errors)
    }
  })

export const useParallelMutationDepartment = (
  vendor_id: string | undefined
) => {
  const queryClient = useQueryClient()
  const { mutateAsync: parallelUpdating, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: any) => {
      return requestsPromiseThatThrowsAnErrorWhenSomeRequestsFailed(payload)
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['departments'], type: 'active' })
    },
    onError: () => {
      queryClient.refetchQueries({ queryKey: ['departments'], type: 'active' })
    },
  })

  return { parallelUpdating, isLoading }
}
