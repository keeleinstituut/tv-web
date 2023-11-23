import { useCallback, useMemo, memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFetchTags } from 'hooks/requests/useTags'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, range, includes } from 'lodash'
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
} from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import { Control, FieldValues, Path, PathValue } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import dayjs from 'dayjs'
import WorkingAndVacationTimesBars, {
  WorkingAndVacationTime,
} from 'components/molecules/WorkingAndVacationTimesBars/WorkingAndVacationTimesBars'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { GetPricesPayload, Price } from 'types/price'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'
import { useFetchSkills } from 'hooks/requests/useVendors'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import { TagTypes } from 'types/tags'
import('dayjs/locale/et')

dayjs.locale('et')

const FreeDaysHeader = () => {
  const { t } = useTranslation()
  return (
    <div className={classes.row}>
      <span>{t('label.free_days')}</span>
      <SmallTooltip
        tooltipContent={t('tooltip.vacation_days')}
        className={classes.headerTooltip}
      />
    </div>
  )
}

interface SelectVendorsTableProps<TFormValues extends FieldValues> {
  // TODO: will actually be prices instead of vendors
  data?: Price[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  filters?: GetPricesPayload
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
  source_language_classifier_value_id?: string
  destination_language_classifier_value_id?: string
  control: Control<TFormValues>
  skill_id?: string
  selectedVendorsIds?: string[]
}

interface PricesTableRow {
  selected: string
  alert_icon?: boolean
  languageDirection: string
  name: string
  working_and_vacation_times: WorkingAndVacationTime[]
  tags: string[]
  skill?: string
  character_fee?: number
  word_fee?: number
  page_fee?: number
  minute_fee?: number
  hour_fee?: number
  minimal_fee?: number
}

const columnHelper = createColumnHelper<PricesTableRow>()

const SelectVendorsTable = <TFormValues extends FieldValues>({
  data = [],
  hidden,
  paginationData,
  filters,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
  skill_id: taskSkillId,
  control,
  selectedVendorsIds,
}: SelectVendorsTableProps<TFormValues>) => {
  const { t } = useTranslation()
  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Vendor,
  })
  const { skillsFilters = [] } = useFetchSkills()

  const { lang_pair, skill_id: selectedSkillFilter, tag_id } = filters || {}

  const srcLangId = lang_pair?.[0]?.src || ''
  const dstLangId = lang_pair?.[0]?.dst || ''

  const matchingLanguageString = `${srcLangId}_${dstLangId}`

  // To populate dropdown
  const {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues,
  } = useLanguageDirections({
    per_page: 40,
    initialSelectedValues: [matchingLanguageString],
  })

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationData ? paginationData.per_page : 10,
  })

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
          skill,
          minimal_fee,
          skill_id,
          vendor_id,
          vendor: {
            tags,
            institution_user: { user },
          },
        }) => {
          const languageDirection = `${source_language_classifier_value.value} > ${destination_language_classifier_value.value}`

          const tagNames = map(tags, 'name')
          const typedSrc = (srcLangId || '') as string
          const typedDst = (dstLangId || '') as string
          const priceLanguageMatch =
            source_language_classifier_value.id === typedSrc &&
            destination_language_classifier_value.id === typedDst

          // TODO: missing currently
          // const working_times = []
          // const vacation_times = []

          const working_and_vacation_times = map(range(0, 14), (number) => {
            const selectedDate = dayjs().add(number, 'day')
            // TODO: check if selectedDate is under working_times
            // 1. if not, then mark it blue for vacation day
            // 2. If it is, check if selectedDate is under vacation_times
            // 3. If yes, then mark it blue for vacation day
            // 4. If not, then mark it green for working day
            return {
              dateString: selectedDate.format('dd DD.MM.YYYY'),
              isVacation: number % 2 === 0,
            }
          })

          return {
            selected: vendor_id,
            alert_icon: taskSkillId !== skill_id || !priceLanguageMatch,
            name: `${user?.forename} ${user?.surname}`,
            languageDirection,
            working_and_vacation_times,
            tags: tagNames,
            skill: skill.name,
            character_fee,
            word_fee,
            page_fee,
            minute_fee,
            hour_fee,
            minimal_fee,
          }
        }
      ),
    [data, dstLangId, srcLangId, taskSkillId]
  )

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      // language_direction will be an array of strings
      const { language_direction, ...rest } = filters || {}
      const typedLanguageDirection = language_direction as string[]

      const langPairs = map(typedLanguageDirection, (direction) => {
        const [src, dst] = direction.split('_')
        return { src, dst }
      })
      const newFilters: FilterFunctionType = {
        ...rest,
        ...(language_direction
          ? {
              lang_pair: langPairs,
            }
          : {}),
      }
      if (typedLanguageDirection) {
        setSelectedValues(typedLanguageDirection)
      }
      if (handleFilterChange) {
        handleFilterChange(newFilters)
      }
    },
    [handleFilterChange, setSelectedValues]
  )

  const columns = [
    columnHelper.accessor('selected', {
      header: '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const vendorId = getValue()
        const isSelectedByDefault = includes(selectedVendorsIds, vendorId)
        return (
          <FormInput
            name={`selected.${getValue()}` as Path<TFormValues>}
            ariaLabel={t('label.select_vendor')}
            control={control}
            inputType={InputTypes.Checkbox}
            disabled={isSelectedByDefault}
            defaultValue={
              isSelectedByDefault as PathValue<TFormValues, Path<TFormValues>>
            }
            // className={classes.fitContent}
          />
        )
      },
    }),
    columnHelper.accessor('alert_icon', {
      header: '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const isVisible = getValue()
        return (
          <SmallTooltip
            tooltipContent={t('tooltip.skill_language_mismatch')}
            className={classes.errorTooltip}
            hidden={!isVisible}
          />
        )
      },
    }),
    columnHelper.accessor('languageDirection', {
      header: () => t('label.language_direction'),
      cell: ({ getValue }) => {
        return <Tag label={getValue()} value />
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: { language_direction: languageDirectionFilters },
        filterValue: map(lang_pair, ({ src, dst }) => `${src}_${dst}`),
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
      },
    }),
    columnHelper.accessor('skill', {
      header: () => t('label.skill'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            <Tag label={getValue() ?? ''} value key={getValue()} />
          </div>
        )
      },
      meta: {
        filterOption: { skill_id: skillsFilters },
        filterValue: selectedSkillFilter,
        showSearch: true,
      },
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('working_and_vacation_times', {
      header: FreeDaysHeader,
      cell: ({ getValue }) => {
        return <WorkingAndVacationTimesBars times={getValue()} />
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.tags'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      meta: {
        filterOption: { tag_id: tagsFilters },
        filterValue: tag_id,
      },
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
      header: () => t('label.minimal_fee'),
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
        pagination={pagination}
        setPagination={setPagination}
      />
    </Root>
  )
}

export default memo(SelectVendorsTable) as typeof SelectVendorsTable
