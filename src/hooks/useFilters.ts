import { isEmpty, keys, omit } from 'lodash'
import { useCallback, useState } from 'react'
import {
  FilterFunctionType,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'

const useFilters = <TFilters>(initialFilters?: TFilters) => {
  const [filters, setFilters] = useState<TFilters | object>(
    initialFilters || {}
  )

  const handleFilterChange = useCallback(
    (value?: FilterFunctionType) => {
      const filterKey = keys(value)[0]
      if (isEmpty(value?.[filterKey])) {
        const removeFilterKey = filters ? omit(filters, filterKey) : {}
        setFilters({ ...removeFilterKey })
      } else {
        setFilters({ ...filters, ...value })
      }
    },
    [filters]
  )

  const handleSortingChange = useCallback(
    (value?: SortingFunctionType) => {
      if (!value?.sort_order) {
        const sortingKeys = keys(value)
        const filtersWithOutSorting = filters ? omit(filters, sortingKeys) : {}
        setFilters({ ...filtersWithOutSorting })
      } else {
        setFilters({ ...filters, ...value })
      }
    },
    [filters]
  )

  const handlePaginationChange = useCallback(
    (value?: PaginationFunctionType) => {
      setFilters({ ...filters, ...value })
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
