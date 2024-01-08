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
  split,
  orderBy,
  replace,
} from 'lodash'
import { escapeSearchString } from 'helpers'

const getIndexOrMax = (
  option: { value: string; label: string },
  query: string
) => {
  const index = option?.label.indexOf(query)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

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

  const handleSetSelectedValues = useCallback(
    (newSelectedValues: string[] | { src?: string; dst?: string }[]) => {
      const formattedNewSelectedValues = map(newSelectedValues, (value) => {
        if (typeof value === 'string') {
          return replace(value, ':', '_')
        }
        const typedValue = value as { src: string; dst: string }
        return `${typedValue?.src}_${typedValue?.dst}`
      })
      setSelectedValues(formattedNewSelectedValues)
    },
    []
  )

  const options = useMemo(() => {
    if (!isLoading) {
      return flatMap(languageFilters, ({ value, label }) =>
        map(languageFilters, ({ value: innerValue, label: innerLabel }) => ({
          label: `${label} > ${innerLabel}`,
          // TODO: seems that different endpoints accept this value in different formats
          value: `${value}_${innerValue}`,
        }))
      )
    }
    return []
    // We only need to wait for request to stop loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const langPairOptions = useMemo(() => {
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

  const allOptions = isLangPair ? langPairOptions : options

  const searchRegexp = useMemo(() => {
    if (isLangPair) {
      return {
        pattern: new RegExp(escapeSearchString(searchString), 'i'),
        orderedBy: searchString,
      }
    }
    if (includes(searchString, ' ') || includes(searchString, '>')) {
      const [firstWord, secondWord] = split(searchString, / > | /)
      return {
        pattern: new RegExp(
          `^(.*?${escapeSearchString(firstWord)}.*? > .*?${escapeSearchString(
            secondWord
          )}.*?)$`,
          'i'
        ),
        orderedBy: searchString,
      }
    }
    return {
      pattern: new RegExp(
        `^(.*?${escapeSearchString(
          searchString
        )}.*? > .*?)|(.*? > .*?${escapeSearchString(searchString)}.*?)$`,
        'i'
      ),
      orderedBy: searchString,
    }
  }, [isLangPair, searchString])

  const filteredOptions = useMemo(() => {
    const { pattern, orderedBy } = searchRegexp
    const filteredOptions = filter(allOptions, ({ label }) =>
      pattern.test(toLower(label))
    )
    const orderedOptions = orderedBy
      ? orderBy(filteredOptions, (item) => getIndexOrMax(item, orderedBy), [
          'asc',
        ])
      : filteredOptions
    return orderedOptions
  }, [allOptions, searchRegexp])

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

  return {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues: handleSetSelectedValues,
  }
}
