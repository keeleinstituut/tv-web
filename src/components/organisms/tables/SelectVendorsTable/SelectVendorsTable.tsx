import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useFetchTags } from 'hooks/requests/useTags'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { map, join, compact, isEmpty, find, reduce, range } from 'lodash'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import Tag from 'components/atoms/Tag/Tag'
import {
  FilterFunctionType,
  SortingFunctionType,
  ResponseMetaTypes,
  PaginationFunctionType,
} from 'types/collective'
import classes from './classes.module.scss'
import { ClassifierValueType } from 'types/classifierValues'
import { Vendor } from 'types/vendors'
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

interface SelectVendorsTableProps {
  // TODO: will actually be prices instead of vendors
  data?: Vendor[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  selectedVendorsIds: string[]
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

interface PricesTableRow {
  selected: string
  languageDirections: string[]
  name: string
  working_and_vacation_times: WorkingAndVacationTime[]
  tags: string[]
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
  data,
  hidden,
  paginationData,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
  selectedVendorsIds,
}) => {
  const { t } = useTranslation()

  const { rolesFilters = [] } = useRolesFetch()
  const { tagsFilters = [] } = useFetchTags()
  const { classifierValuesFilters = [] } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  }) // TODO: save them to local state when API available?

  const selectedValues = useMemo(
    () =>
      isEmpty(data)
        ? {}
        : reduce(
            data,
            (result, vendor, index) => {
              if (!vendor) return result
              return {
                ...result,
                [vendor.id]: find(selectedVendorsIds, { id: vendor.id }),
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

  // export type Vendor = {
  //   id?: string
  //   institution_user: UserType
  //   company_name: string
  //   prices: Price[]
  //   tags: Tag[]
  //   comment: string
  // } & DiscountPercentages

  // export type DiscountPercentages = {
  //   discount_percentage_0_49: string
  //   discount_percentage_50_74: string
  //   discount_percentage_75_84: string
  //   discount_percentage_85_94: string
  //   discount_percentage_95_99: string
  //   discount_percentage_100: string
  //   discount_percentage_101: string
  //   discount_percentage_repetitions: string
  // }

  const tableData = useMemo(() => {
    return (
      map(data, ({ id, tags, prices, institution_user: { roles, user } }) => {
        const languageDirections = map(
          prices,
          ({
            source_language_classifier_value: srcLang,
            destination_language_classifier_value: destLang,
          }) => `${srcLang.value} > ${destLang.value}`
        )

        const {
          character_fee,
          word_fee,
          page_fee,
          minute_fee,
          hour_fee,
          minimal_fee,
        } = prices[0]

        const tagNames = map(tags, 'name')
        // const skillNames = map(skills, 'name')

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
            dateString: selectedDate.format('d DD.MM.YYYY'),
            isVacation: number % 2 === 0,
          }
        })

        return {
          selected: id,
          name: `${user?.forename} ${user?.surname}`,
          languageDirections,
          working_and_vacation_times,
          tags: tagNames,
          // skills: skillNames,
          character_fee,
          word_fee,
          page_fee,
          minute_fee,
          hour_fee,
          minimal_fee,
        }
      }) || {}
    )
  }, [data])

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
    columnHelper.accessor('languageDirections', {
      header: () => t('label.language_directions'),
      cell: ({ getValue }) => {
        return (
          <div className={classes.tagsRow}>
            {map(getValue(), (value) => (
              <Tag label={value} value key={value} />
            ))}
          </div>
        )
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('working_and_vacation_times', {
      header: () => (
        <>
          <span>{t('label.free_days')}</span>
          <SmallTooltip
            tooltipContent={t('tooltip.main_write_helper')}
            className={classes.headerTooltip}
          />
        </>
      ),
      cell: ({ getValue }) => {
        return <WorkingAndVacationTimesBars times={getValue()} />
      },
      footer: (info) => info.column.id,
      meta: {
        filterOption: { role_id: rolesFilters },
      },
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
  ] as ColumnDef<PricesTableRow>[] // Seems like an package issue https://github.com/TanStack/table/issues/4382

  if (hidden) return null

  return (
    <DataTable
      data={tableData}
      columns={columns}
      tableSize={TableSizeTypes.M}
      paginationData={paginationData}
      onPaginationChange={handlePaginationChange}
      onFiltersChange={handleFilterChange}
      onSortingChange={handleSortingChange}
    />
  )
}

export default SelectVendorsTable
