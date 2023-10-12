import { keys, omit, isEqual, pickBy } from 'lodash'
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
      setFilters(pickBy({ ...filters, ...value }, (val) => !!val))
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
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export default useFilters
