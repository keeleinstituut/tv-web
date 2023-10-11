import { useCallback, useMemo, useState } from 'react'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from './useClassifierValues'
import {
  map,
  flatMap,
  size,
  filter,
  take,
  toLower,
  isEmpty,
  includes,
  uniqBy,
} from 'lodash'

export const useLanguageDirections = ({
  per_page = 40,
  initialSelectedValues = [],
  isLangPair = false,
}: {
  per_page?: number
  initialSelectedValues?: string[]
  isLangPair?: boolean
}) => {
  const { classifierValuesFilters: languageFilters, isLoading } =
    useClassifierValuesFetch({
      type: ClassifierValueType.Language,
    })

  const [currentPage, setCurrentPage] = useState(1)
  const [searchString, handleSearch] = useState('')
  const [selectedValues, setSelectedValues] = useState(initialSelectedValues)

  const options = useMemo(() => {
    if (!isLoading) {
      return flatMap(languageFilters, ({ value, label }) =>
        map(languageFilters, ({ value: innerValue, label: innerLabel }) => ({
          label: `${label} > ${innerLabel}`,
          value: `${value}_${innerValue}`,
        }))
      )
    }
    return []
    // We only need to wait for request to stop loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const LangPairOptions = useMemo(() => {
    if (!isLoading) {
      return flatMap(languageFilters, ({ value, label }) =>
        map(languageFilters, ({ value: innerValue, label: innerLabel }) => {
          const shortLabel = label.match(/\[(.*?)-/)
          const shortInner = innerLabel.match(/\[(.*?)-/)
          return {
            label: `${shortLabel?.[1]}_${shortInner?.[1]}`,
            value: `${shortLabel?.[1]}_${shortInner?.[1]}`,
          }
        })
      )
    }
    return []
    // We only need to wait for request to stop loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const allOptions = isLangPair ? LangPairOptions : options

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

  const selectedOptions = useMemo(() => {
    if (isEmpty(selectedValues)) return []
    return filter(filteredOptions, ({ value }) =>
      includes(selectedValues, value)
    )
  }, [selectedValues, filteredOptions])

  const loadMore = useCallback(() => {
    if (currentPage * per_page < size(allOptions)) {
      setCurrentPage(currentPage + 1)
    }
  }, [allOptions, currentPage, per_page])

  const languageDirectionFilters = useMemo(
    () =>
      uniqBy(
        [
          // We always show selected options on top, if they match the search string
          ...selectedOptions,
          ...take(filteredOptions, per_page * currentPage),
        ],
        'value'
      ),
    [selectedOptions, filteredOptions, per_page, currentPage]
  )

  return { languageDirectionFilters, loadMore, handleSearch, setSelectedValues }
}
