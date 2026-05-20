import { GetPricesPayload, LanguageClassifierValue, Price } from 'types/price'
import {
  VendorsDataType,
  GetVendorsPayload,
  UpdateVendorPayload,
  DeletePricesPayload,
  GetSkillsPayload,
  VendorResponse,
  DeleteVendorsPayload,
  CreateVendorPayload,
  UpdatePricesPayload,
  Vendor,
  SkillsData,
} from 'types/vendors'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { endpoints } from 'api/endpoints'
import { apiClient } from 'api'
import useFilters from 'hooks/useFilters'
import { compact, filter, find, includes, map } from 'lodash'
import { useMemo } from 'react'
import { ResponseMetaTypes } from 'types/collective'
import { UsersDataType } from 'types/users'
import { DataStateTypes } from 'components/organisms/modals/EditableListModal/EditableListModal'
import { InstitutionPrice, VendorSkillLanguage } from 'types/vendorPricing'

export const useVendorsFetch = (
  initialFilters?: GetVendorsPayload,
  saveQueryParams?: boolean
) => {
  const {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFilters<GetVendorsPayload>(initialFilters, saveQueryParams)

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
    filters: filters as GetVendorsPayload,
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

export const useFetchVendor = ({ id }: { id?: string }) => {
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

export const useFetchInstitutionUserVendor = (institutionUserId?: string) => {
  const { isLoading, data } = useQuery<VendorResponse>({
    enabled: !!institutionUserId,
    queryKey: ['institution-user-vendor', institutionUserId],
    queryFn: () =>
      apiClient.get(
        endpoints.INSTITUTION_USER_VENDOR(institutionUserId!),
        {},
        { hideError: true }
      ),
    staleTime: Infinity,
    retry: false,
  })
  return { isLoading, vendor: data?.data ?? null }
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
    queryFn: () => apiClient.get(endpoints.SKILLS),
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

type SkillPriceWithRefs = {
  id?: string
  vendor_id?: string
  skill_id: string
  src_lang_classifier_value_id?: string
  dst_lang_classifier_value_id?: string
}

// Joins vendor-skill-languages (capability) with institution-prices (fees)
// to keep emitting Price-shaped rows for legacy consumers.
export const useAllPricesFetch = ({
  disabled,
  saveQueryParams,
  initialFilters,
}: {
  initialFilters?: GetVendorsPayload
  disabled?: boolean
  saveQueryParams?: boolean
}) => {
  const {
    filters,
    handlePaginationChange,
    handleFilterChange,
    handleSortingChange,
  } = useFilters<GetPricesPayload>(initialFilters, saveQueryParams)

  const f = filters as GetPricesPayload | undefined
  const vslParams = {
    vendor_id: f?.vendor_id,
    institution_user_name: f?.institution_user_name,
    src_lang_classifier_value_id: f?.src_lang_classifier_value_id,
    dst_lang_classifier_value_id: f?.dst_lang_classifier_value_id,
    skill_id: f?.skill_id,
    lang_pair: f?.lang_pair,
    per_page: f?.per_page,
    page: f?.page,
    sort_by: f?.sort_by === 'lang_pair' ? 'lang_pair' : 'created_at',
    sort_order: f?.sort_order,
  }

  const {
    data: vslData,
    isLoading: vslLoading,
    isError,
  } = useQuery<{ data: VendorSkillLanguage[]; meta?: ResponseMetaTypes }>({
    queryKey: ['allPrices', filters],
    queryFn: () => apiClient.get(endpoints.VENDOR_SKILL_LANGUAGES, vslParams),
    keepPreviousData: true,
    enabled: !disabled,
  })

  // Institution-wide fee table is keyed by (skill, src_lang, dst_lang).
  // 500 covers ~25 skills × 20 language pairs, more than any institution we ship today.
  // If this becomes too small, paginate.
  const { data: ipData, isLoading: ipLoading } = useQuery<{
    data: InstitutionPrice[]
  }>({
    queryKey: ['institution-prices-card'],
    queryFn: () =>
      apiClient.get(endpoints.INSTITUTION_PRICES, { per_page: 500 }),
    enabled: !disabled,
    staleTime: 60_000,
  })

  const prices = useMemo<Price[] | undefined>(() => {
    if (!vslData?.data) return undefined
    return map(vslData.data, (vsl) => {
      const ip = find(ipData?.data ?? [], {
        skill_id: vsl.skill_id,
        src_lang_classifier_value_id: vsl.src_lang_classifier_value_id,
        dst_lang_classifier_value_id: vsl.dst_lang_classifier_value_id,
      })
      return {
        id: vsl.id,
        vendor_id: vsl.vendor_id,
        skill_id: vsl.skill_id,
        src_lang_classifier_value_id: vsl.src_lang_classifier_value_id,
        dst_lang_classifier_value_id: vsl.dst_lang_classifier_value_id,
        created_at: vsl.created_at,
        updated_at: vsl.updated_at,
        character_fee: ip?.character_fee ?? 0,
        word_fee: ip?.word_fee ?? 0,
        page_fee: ip?.page_fee ?? 0,
        minute_fee: ip?.minute_fee ?? 0,
        hour_fee: ip?.hour_fee ?? 0,
        minimal_fee: ip?.minimal_fee ?? 0,
        source_language_classifier_value:
          vsl.source_language_classifier_value as LanguageClassifierValue,
        destination_language_classifier_value:
          vsl.destination_language_classifier_value as LanguageClassifierValue,
        vendor: vsl.vendor as Vendor,
        skill: vsl.skill ?? { id: vsl.skill_id, name: '' },
      } as Price
    })
  }, [vslData?.data, ipData?.data])

  return {
    isLoading: vslLoading || ipLoading,
    isError,
    prices,
    dates: undefined as
      | { min_created_at?: string; max_updated_at?: string }
      | undefined,
    paginationData: vslData?.meta,
    filters: filters as GetPricesPayload,
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
      apiClient.delete(endpoints.VENDOR_SKILL_LANGUAGES_BULK, {
        id: payload.id,
      }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
      queryClient.refetchQueries({ queryKey: ['vendor-skill-languages'] })
    },
  })

  return { deletePrices, isLoading }
}

// Per-vendor fees no longer exist server-side. NEW rows add a vendor-skill-language
// capability row; DELETED rows remove one. UPDATED rows are rejected: fees are
// now institution-wide and must be edited via /institution-prices instead.
// Delete is run before create so a partial failure leaves the user with strictly
// fewer rows than before, never a duplicate-key conflict on retry.
export const useParallelUpdatePrices = ({
  vendor_id,
}: {
  vendor_id?: string
  filters?: GetPricesPayload
}) => {
  const queryClient = useQueryClient()
  const { mutateAsync: parallelUpdating, isLoading } = useMutation({
    mutationKey: ['prices', vendor_id],
    mutationFn: async (payload: UpdatePricesPayload) => {
      const ops = payload.data
      const updatedOp = find(ops, { state: DataStateTypes.UPDATED })
      if (updatedOp && updatedOp.prices.length > 0) {
        throw new Error(
          'Per-vendor fees can no longer be edited. Update institution-wide fees under Asutuse hinnakiri.'
        )
      }
      const newOp = find(ops, { state: DataStateTypes.NEW })
      const deletedOp = find(ops, { state: DataStateTypes.DELETED })

      if (deletedOp && deletedOp.prices.length > 0) {
        const ids = compact(map(deletedOp.prices, 'id'))
        if (ids.length > 0) {
          await apiClient.delete(endpoints.VENDOR_SKILL_LANGUAGES_BULK, {
            id: ids,
          })
        }
      }
      if (newOp && newOp.prices.length > 0) {
        const rows = compact(
          map(newOp.prices, (p) => {
            const ext = p as unknown as SkillPriceWithRefs
            if (
              !ext.skill_id ||
              !ext.src_lang_classifier_value_id ||
              !ext.dst_lang_classifier_value_id
            ) {
              return null
            }
            return {
              vendor_id: ext.vendor_id ?? vendor_id ?? '',
              skill_id: ext.skill_id,
              src_lang_classifier_value_id: ext.src_lang_classifier_value_id,
              dst_lang_classifier_value_id: ext.dst_lang_classifier_value_id,
            }
          })
        )
        if (rows.length > 0) {
          await apiClient.post(endpoints.VENDOR_SKILL_LANGUAGES_BULK, {
            data: rows,
          })
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['allPrices'] })
      queryClient.refetchQueries({ queryKey: ['vendor-skill-languages'] })
    },
  })

  return { parallelUpdating, isLoading }
}

export const useSkillsCache = (): { skills: SkillsData[] | undefined } => {
  const queryClient = useQueryClient()
  const skillsCache: { data: SkillsData[] } | undefined =
    queryClient.getQueryData(['skills'])

  return { skills: skillsCache?.data }
}
