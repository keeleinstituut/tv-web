import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { debounce, isEmpty, map, split } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import { Price } from 'types/price'
import { Root } from '@radix-ui/react-form'
import { useAllPricesFetch, useFetchSkills } from 'hooks/requests/useVendors'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'

import classes from './classes.module.scss'
import TextInput from 'components/molecules/TextInput/TextInput'
import classNames from 'classnames'
import Loader from 'components/atoms/Loader/Loader'
import { useSearchParams } from 'react-router-dom'

interface GeneralPriceListTableProps {
  data?: Price[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
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
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  const [searchParams, _] = useSearchParams()
  const initialFilters = {
    ...Object.fromEntries(searchParams.entries()),
    skill_id: searchParams.getAll('skill_id'),
  }

  const {
    prices,
    paginationData,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch(initialFilters, true)

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get('institution_user_name') || ''
  )

  const defaultPaginationData = {
    per_page: Number(searchParams.get('per_page')),
    page: Number(searchParams.get('page')) - 1,
  }

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(
        handleFilterChange,
        300
      )({ institution_user_name: event.target.value })
    },
    [handleFilterChange]
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
      },
    }),
    columnHelper.accessor('skill', {
      header: () => t('label.skill'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { skill_id: skillsFilters },
        showSearch: true,
        filterValue: initialFilters?.skill_id,
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
          searchParams.get('sort_by') == 'character_fee'
            ? searchParams.get('sort_order')
            : '',
      },
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('label.word_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          searchParams.get('sort_by') == 'word_fee'
            ? searchParams.get('sort_order')
            : '',
      },
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('label.page_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          searchParams.get('sort_by') == 'page_fee'
            ? searchParams.get('sort_order')
            : '',
      },
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('label.minute_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          searchParams.get('sort_by') == 'minute_fee'
            ? searchParams.get('sort_order')
            : '',
      },
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('label.hour_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          searchParams.get('sort_by') == 'hour_fee'
            ? searchParams.get('sort_order')
            : '',
      },
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('label.min_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
        currentSorting:
          searchParams.get('sort_by') == 'minimal_fee'
            ? searchParams.get('sort_order')
            : '',
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
