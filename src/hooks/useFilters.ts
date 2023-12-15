import { keys, omit, isEqual, pickBy } from 'lodash'
import { useCallback, useState } from 'react'
import { ParamKeyValuePair, useSearchParams } from 'react-router-dom'
import {
  FilterFunctionType,
  LanguagePairType,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { stringifyLanguagePairs } from 'helpers'

const useFilters = <TFilters>(
  initialFilters?: TFilters,
  saveParams?: boolean
) => {
  const [filters, setFilters] = useState<TFilters | object>({
    per_page: 10,
    page: 1,
    ...initialFilters,
  })
  const page = '1'
  const [_, setSearchParams] = useSearchParams()

  const setModifiedSetSearchParams = useCallback(
    (value?: any) => {
      if (
        value?.lang_pair &&
        typeof (value.lang_pair as LanguagePairType[] | string[])[0] != 'string'
      ) {
        const formatted_lang_pairs = stringifyLanguagePairs(
          value.lang_pair as LanguagePairType[]
        )
        setSearchParams({
          ...omit(value, 'lang_pair'),
          ...formatted_lang_pairs,
        })
      } else {
        setSearchParams(value)
      }
    },
    [setSearchParams]
  )

  const handleFilterChange = useCallback(
    (value?: FilterFunctionType) => {
      setFilters(pickBy({ ...filters, ...value, page }, (val) => !!val))
      if (saveParams) {
        setModifiedSetSearchParams(
          pickBy({ ...filters, ...value, page }, (val) => !!val)
        )
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
          setModifiedSetSearchParams({ ...filtersWithOutSorting, page })
        }
      } else {
        setFilters({ ...filters, ...value, page })
        if (saveParams) {
          setModifiedSetSearchParams({ ...filters, ...value, page })
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
          setModifiedSetSearchParams({
            ...filters,
            ...value,
          } as ParamKeyValuePair[])
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
