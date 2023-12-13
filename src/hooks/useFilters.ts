import { keys, omit, isEqual, pickBy } from 'lodash'
import { useCallback, useState } from 'react'
import { ParamKeyValuePair, useSearchParams } from 'react-router-dom'
import {
  FilterFunctionType,
  LanguagePairType,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { formatLanguagePairs } from '../helpers'

const useFilters = <TFilters>(
  initialFilters?: TFilters,
  saveParams?: boolean
) => {
  const [filters, setFilters] = useState<TFilters | object>(
    initialFilters || {}
  )
  const page = '1'
  const [_, setSearchParams] = useSearchParams()

  const handleFilterChange = useCallback(
    (value?: FilterFunctionType) => {
      setFilters(pickBy({ ...filters, ...value, page }, (val) => !!val))

      if (saveParams) {
        if (value?.lang_pair) {
          const formatted_lang_pairs = formatLanguagePairs(
            value.lang_pair as LanguagePairType[]
          )
          setSearchParams({
            ...omit(
              pickBy({ ...filters, ...value, page }, (val) => !!val),
              'lang_pair'
            ),
            ...formatted_lang_pairs,
          })
        } else {
          setSearchParams(
            pickBy({ ...filters, ...value, page }, (val) => !!val)
          )
        }
      }
    },
    [filters]
  )

  const handleSortingChange = useCallback(
    (value?: SortingFunctionType) => {
      if (!value?.sort_order) {
        const sortingKeys = keys(value)
        const filtersWithOutSorting = filters ? omit(filters, sortingKeys) : {}
        setFilters({ ...filtersWithOutSorting, page })
        if (saveParams) {
          setSearchParams({ ...filtersWithOutSorting, page })
        }
      } else {
        setFilters({ ...filters, ...value, page })
        if (saveParams) {
          setSearchParams({ ...filters, ...value, page })
        }
      }
    },
    [filters]
  )

  const handlePaginationChange = useCallback(
    (value?: PaginationFunctionType) => {
      // using deep comparison here, since this will trigger a refetch and we want to make sure we avoid
      // any unnecessary requests
      if (!isEqual(filters, value)) {
        setFilters({ ...filters, ...value })
        if (saveParams) {
          setSearchParams({ ...filters, ...value } as ParamKeyValuePair[])
        }
      }
    },
    [filters]
  )

  return {
    filters,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export default useFilters
