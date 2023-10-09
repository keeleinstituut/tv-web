import { keys, omit, isEqual, isEmpty, pickBy } from 'lodash'
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
  const [tmSearchValue, setTmSearchValue] = useState<TFilters | object>({})

  const handleOnSearch = useCallback(
    (value?: FilterFunctionType) => {
      const emptyValues = pickBy(value, isEmpty)
      const emptyKeys = keys(emptyValues)
      if (!isEmpty(emptyKeys)) {
        const filtersWithOutSearch = filters ? omit(filters, emptyKeys) : {}
        setFilters({ ...filtersWithOutSearch })
        setTmSearchValue({})
      } else {
        setFilters({ ...filters, ...value })
        setTmSearchValue({ ...value })
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
    tmSearchValue,
    handleOnSearch,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  }
}

export default useFilters
