import { keys, omit, isEqual, pickBy } from 'lodash'
import { useCallback, useState } from 'react'
import { ParamKeyValuePair, useSearchParams } from 'react-router-dom'
import { useDeepCompareEffect } from 'ahooks'
import {
  FilterFunctionType,
  LanguagePairType,
  PaginationFunctionType,
  SortingFunctionType,
} from 'types/collective'
import { stringifyLanguagePairs } from 'helpers'

const useFilters = <TFilters extends object>(
  initialFilters?: TFilters,
  saveParams?: boolean
) => {
  const [filters, setFilters] = useState<TFilters | object>({
    ...initialFilters,
  })
  const page = '1'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams()

  const setModifiedSetSearchParams = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  useDeepCompareEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
    if (saveParams) {
      setModifiedSetSearchParams(initialFilters)
    }
  }, [initialFilters])

  const handleFilterChange = useCallback(
    (value?: FilterFunctionType) => {
      setFilters(
        pickBy(
          { ...filters, ...value, page },
          (val: string | number) => val === 0 || !!val
        )
      )
      if (saveParams) {
        setModifiedSetSearchParams(
          pickBy(
            { ...filters, ...value, page },
            (val: string | number) => val === 0 || !!val
          )
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
