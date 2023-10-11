import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, split } from 'lodash'
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
import { useFetchSkills } from 'hooks/requests/useVendors'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'

import classes from './classes.module.scss'

interface GeneralPriceListTableProps {
  data?: Price[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  selectedVendorsIds?: string[]
  taskSkills?: string[]
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
  source_language_classifier_value_id?: string
  destination_language_classifier_value_id?: string
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

const GeneralPriceListTable: FC<GeneralPriceListTableProps> = ({
  data = [],
  hidden,
  paginationData,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()
  const { skillsFilters = [] } = useFetchSkills()
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  const tableData = useMemo(
    () =>
      map(
        data,
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
    [data]
  )

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      // language_direction will be an array of strings
      const { language_direction, ...rest } = filters || {}
      const typedLanguageDirection = language_direction as string[]

      const langPair = map(
        typedLanguageDirection,
        (languageDirectionString) => {
          const [src, dst] = split(languageDirectionString, '>')
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
      },
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('label.word_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('label.page_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('label.minute_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('label.hour_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('label.min_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
      meta: {
        sortingOption: ['asc', 'desc'],
      },
    }),
  ] as ColumnDef<PricesTableRow>[]

  if (hidden) return null

  return (
    <Root className={classes.container}>
      <DataTable
        data={tableData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleModifiedFilterChange}
        onSortingChange={handleSortingChange}
        className={classes.tableContainer}
      />
    </Root>
  )
}

export default GeneralPriceListTable
