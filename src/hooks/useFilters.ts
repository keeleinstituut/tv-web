import { keys, omit, isEqual } from 'lodash'
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
  const handleOnSearch = useCallback(
    (value?: FilterFunctionType) => {
      console.log('value', value)
      const sortingKeys = keys(value)
      if (!value?.fullname) {
        const filtersWithOutSorting = filters ? omit(filters, sortingKeys) : {}
        setFilters({ ...filtersWithOutSorting })
      } else {
        setFilters({ ...filters, ...value })
      }
    },
    [filters]
  )

  const handleFilterChange = useCallback(
    (value?: FilterFunctionType) => {
      setFilters({ ...filters, ...value })
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
      // using deep comparison here, since this will trigger a refetch and we want to make sure we avoid
      // any unnecessary requests
      if (!isEqual(filters, value)) {
        setFilters({ ...filters, ...value })
      }
    },
    [filters]
  )

  return {
    filters,
    handleOnSearch,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export default useFilters
