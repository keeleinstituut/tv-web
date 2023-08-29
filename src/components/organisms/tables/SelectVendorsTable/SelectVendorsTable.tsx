import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useFetchTags } from 'hooks/requests/useTags'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import {
  map,
  isEmpty,
  find,
  reduce,
  range,
  includes,
  split,
  size,
} from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import { ClassifierValueType } from 'types/classifierValues'
import { useForm } from 'react-hook-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import dayjs from 'dayjs'
import WorkingAndVacationTimesBars, {
  WorkingAndVacationTime,
} from 'components/molecules/WorkingAndVacationTimesBars/WorkingAndVacationTimesBars'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import { Price } from 'types/price'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'
import { useFetchSkills } from 'hooks/requests/useVendors'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import('dayjs/locale/et')

dayjs.locale('et')

interface SelectVendorsTableProps {
  // TODO: will actually be prices instead of vendors
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

interface FormValues {
  selected: { [key in string]?: boolean }
}

const columnHelper = createColumnHelper<PricesTableRow>()

const SelectVendorsTable: FC<SelectVendorsTableProps> = ({
  data = [],
  hidden,
  paginationData,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
  taskSkills = [],
  selectedVendorsIds = [],
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
}) => {
  const { t } = useTranslation()
  const { tagsFilters = [] } = useFetchTags()
  const { skillsFilters = [] } = useFetchSkills()
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  const selectedValues = useMemo(
    () =>
      isEmpty(data)
        ? {}
        : reduce(
            data,
            (result, price) => {
              if (!price) return result
              return {
                ...result,
                [price.id]: find(selectedVendorsIds, { id: price.vendor.id }),
              }
            },
            {}
          ),
    [data, selectedVendorsIds]
  )

  const { control, handleSubmit, setError, clearErrors } = useForm<FormValues>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    values: {
      selected: selectedValues,
    },
    resetOptions: {
      keepErrors: true,
    },
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
          minimal_fee,
          skill_id,
          vendor: {
            tags,
            skills,
            institution_user: { user },
          },
        }) => {
          const languageDirection = `${source_language_classifier_value.value} > ${destination_language_classifier_value.value}`

          const tagNames = map(tags, 'name')
          const skill = find(skills, { id: skill_id })?.name
          const priceLanguageMatch =
            source_language_classifier_value.id ===
              source_language_classifier_value_id &&
            destination_language_classifier_value.id ===
              destination_language_classifier_value_id

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
            selected: id,
            alert_icon: !includes(taskSkills, skill_id) || !priceLanguageMatch,
            name: `${user?.forename} ${user?.surname}`,
            languageDirection,
            working_and_vacation_times,
            tags: tagNames,
            skill,
            character_fee,
            word_fee,
            page_fee,
            minute_fee,
            hour_fee,
            minimal_fee,
          }
        }
      ),
    [
      data,
      destination_language_classifier_value_id,
      source_language_classifier_value_id,
      taskSkills,
    ]
  )

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      // language_direction will be an array of strings
      const { language_direction, ...rest } = filters || {}
      const typedLanguageDirection = language_direction as string[]
      const newFilters: FilterFunctionType = {
        ...rest,
        ...(language_direction
          ? {
              source_languages: map(
                typedLanguageDirection,
                (languageDirectionString) =>
                  split(languageDirectionString, '-')[0]
              ),
              destination_languages: map(
                typedLanguageDirection,
                (languageDirectionString) =>
                  split(languageDirectionString, '-')[0]
              ),
            }
          : {}),
      }
      if (handleFilterChange) {
        handleFilterChange(newFilters)
      }
    },
    [handleFilterChange]
  )

  const columns = [
    columnHelper.accessor('selected', {
      header: '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return (
          <FormInput
            name={`selected.${getValue()}`}
            ariaLabel={t('label.select_vendor')}
            control={control}
            inputType={InputTypes.Checkbox}
            // className={classes.fitContent}
          />
        )
      },
    }),
    columnHelper.accessor('alert_icon', {
      header: '',
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        return <SmallTooltip />
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
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      meta: {
        filterOption: { skill_id: skillsFilters },
        showSearch: true,
      },
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('working_and_vacation_times', {
      header: () => (
        <div className={classes.row}>
          <span>{t('label.free_days')}</span>
          <SmallTooltip
            tooltipContent={t('tooltip.main_write_helper')}
            className={classes.headerTooltip}
          />
        </div>
      ),
      cell: ({ getValue }) => {
        return <WorkingAndVacationTimesBars times={getValue()} />
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('tags', {
      header: () => t('label.order_tags'),
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
      />
    </Root>
  )
}

export default SelectVendorsTable
