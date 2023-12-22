import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { debounce, isEmpty, map, split } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import { FilterFunctionType } from 'types/collective'
import { GetPricesPayload } from 'types/price'
import { Root } from '@radix-ui/react-form'
import { useAllPricesFetch, useFetchSkills } from 'hooks/requests/useVendors'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'

import classes from './classes.module.scss'
import TextInput from 'components/molecules/TextInput/TextInput'
import classNames from 'classnames'
import Loader from 'components/atoms/Loader/Loader'
import { useSearchParams } from 'react-router-dom'
import { parseLanguagePairs } from 'helpers'

type GeneralPriceListTableProps = {
  hidden?: boolean
}
interface PricesTableRow {
  languageDirection: string
  name: string
  skill?: string
  character_fee?: number
  word_fee?: number
  page_fee?: number
  minute_fee?: number
  hour_fee?: number
  minimal_fee?: number
}

const columnHelper = createColumnHelper<PricesTableRow>()

const GeneralPriceListTable: FC<GeneralPriceListTableProps> = ({ hidden }) => {
  const { t } = useTranslation()
  const { skillsFilters = [] } = useFetchSkills()
  const {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues,
  } = useLanguageDirections({})

  const [searchParams] = useSearchParams()
  const initialFilters = {
    per_page: 10,
    page: 1,
    ...Object.fromEntries(searchParams.entries()),
    skill_id: searchParams.getAll('skill_id'),
    lang_pair: parseLanguagePairs(searchParams),
  }

  const {
    prices,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    filters,
  } = useAllPricesFetch({
    initialFilters: initialFilters as GetPricesPayload,
    saveQueryParams: true,
  })

  useEffect(() => {
    setSelectedValues(filters?.lang_pair || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.lang_pair])

  const defaultPaginationData = {
    per_page: Number(filters.per_page),
    page: Number(filters.page) - 1,
  }

  const [searchValue, setSearchValue] = useState<string>(
    filters?.institution_user_name || ''
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useCallback(
    debounce(handleFilterChange, 300, {
      leading: false,
      trailing: true,
    }),
    [handleFilterChange]
  )

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debouncedChangeHandler({ institution_user_name: event.target.value })
    },
    [debouncedChangeHandler]
  )

  const tableData = useMemo(
    () =>
      map(
        prices,
        ({
          id,
          source_language_classifier_value,
          destination_language_classifier_value,
          character_fee,
          word_fee,
          page_fee,
          minute_fee,
          hour_fee,
          minimal_fee,
          skill: { name },
          vendor: {
            institution_user: { user },
          },
        }) => {
          const languageDirection = `${source_language_classifier_value.value} > ${destination_language_classifier_value.value}`

          return {
            key: id,
            name: `${user?.forename} ${user?.surname}`,
            languageDirection,
            skill: name,
            character_fee,
            word_fee,
            page_fee,
            minute_fee,
            hour_fee,
            minimal_fee,
          }
        }
      ),
    [prices]
  )

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      // language_direction will be an array of strings
      const { language_direction, ...rest } = filters || {}
      const typedLanguageDirection = language_direction as string[]

      const langPair = map(
        typedLanguageDirection,
        (languageDirectionString) => {
          const [src, dst] = split(languageDirectionString, '_')
          return { src, dst }
        }
      )

      const newFilters = {
        lang_pair: langPair,
        ...rest,
      }

      if (handleFilterChange) {
        handleFilterChange(newFilters)
      }
    },
    [handleFilterChange]
  )

  const columns = [
    columnHelper.accessor('languageDirection', {
      header: () => t('label.language_direction'),
      cell: ({ getValue }) => {
        return <Tag label={getValue()} value />
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: { language_direction: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
        filterValue: map(
          filters.lang_pair || [],
          ({ src, dst }) => `${src}_${dst}`
        ),
      },
    }),
    columnHelper.accessor('skill', {
      header: () => t('label.skill'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { skill_id: skillsFilters },
        showSearch: true,
        filterValue: filters?.skill_id || [],
      },
      size: 200,
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
      size: 300,
    }),
    columnHelper.accessor('character_fee', {
      header: () => t('label.character_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'character_fee' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('label.word_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'word_fee' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('label.page_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'page_fee' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('label.minute_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'minute_fee' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('label.hour_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'hour_fee' ? filters.sort_order : '',
      },
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('label.min_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          filters?.sort_by === 'minimal_fee' ? filters.sort_order : '',
      },
    }),
  ] as ColumnDef<PricesTableRow>[]

  if (hidden) return null

  return (
    <Root className={classes.container}>
      <Loader loading={isLoading && isEmpty(prices)} />
      <DataTable
        data={tableData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleModifiedFilterChange}
        onSortingChange={handleSortingChange}
        defaultPaginationData={defaultPaginationData}
        headComponent={
          <div className={classNames(classes.topSection)}>
            <TextInput
              name={'search'}
              ariaLabel={t('label.search_by_name_here')}
              placeholder={t('label.search_by_name_here')}
              value={searchValue}
              onChange={handleSearchVendors}
              className={classes.searchInput}
              inputContainerClassName={classes.generalPriceListInput}
              isSearch
            />
          </div>
        }
      />
    </Root>
  )
}

export default GeneralPriceListTable
