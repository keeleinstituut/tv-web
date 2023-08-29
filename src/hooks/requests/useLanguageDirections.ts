import { useCallback, useMemo, useState } from 'react'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from './useClassifierValues'
import { map, flatMap, size, filter, take, toLower } from 'lodash'

export const useLanguageDirections = ({
  per_page = 40,
}: {
  per_page?: number
}) => {
  const { classifierValuesFilters: languageFilters, isLoading } =
    useClassifierValuesFetch({
      type: ClassifierValueType.Language,
    })

  const [currentPage, setCurrentPage] = useState(1)
  const [searchString, handleSearch] = useState('')

  const allOptions = useMemo(() => {
    if (!isLoading) {
      return flatMap(languageFilters, ({ value, label }) =>
        map(languageFilters, ({ value: innerValue, label: innerLabel }) => ({
          label: `${label} > ${innerLabel}`,
          value: `${value}-${innerValue}`,
        }))
      )
    }
    return []
    // We only need to wait for request to stop loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const searchRegexp = useMemo(() => {
    const escapedSearchString = toLower(searchString).replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    )
    return new RegExp(escapedSearchString, 'i')
  }, [searchString])

  const filteredOptions = useMemo(
    () => filter(allOptions, ({ label }) => searchRegexp.test(toLower(label))),
    [allOptions, searchRegexp]
  )

  const loadMore = useCallback(() => {
    if (currentPage * per_page < size(allOptions)) {
      setCurrentPage(currentPage + 1)
    }
  }, [allOptions, currentPage, per_page])

  const languageDirectionFilters = useMemo(
    () => take(filteredOptions, per_page * currentPage),
    [filteredOptions, per_page, currentPage]
  )

  return { languageDirectionFilters, loadMore, handleSearch }
}
