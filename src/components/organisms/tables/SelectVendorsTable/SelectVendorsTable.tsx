import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useFetchTags } from 'hooks/requests/useTags'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { map, isEmpty, find, reduce, range } from 'lodash'
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
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import('dayjs/locale/et')

dayjs.locale('et')

const mockPrice = {
  id: 'random',
  source_language_classifier_value: {
    id: '99c8bbac-47ec-4301-9dbc-89ec41965271',
    type: 'LANGUAGE',
    value: 'zh-TW',
    name: 'Chinese Traditional',
    meta: {
      iso3_code: 'zh-TW',
    },
    synced_at: null,
    deleted_at: null,
  },
  destination_language_classifier_value: {
    id: '99c8bbac-6b00-4bad-96be-d18206faf8a0',
    type: 'LANGUAGE',
    value: 'lg-UG',
    name: 'Luganda',
    meta: {
      iso3_code: 'lg-UG',
    },
    synced_at: null,
    deleted_at: null,
  },
  character_fee: 0.25,
  word_fee: 1,
  page_fee: 12,
  minute_fee: 0.5,
  hour_fee: 50,
  minimal_fee: 1250,
  skill_id: 'random2',
  vendor: {
    id: 'RandomVendorId',
    institution_user: {
      created_at: '2023-08-01T07:16:52.000000Z',
      updated_at: '2023-08-01T07:16:52.000000Z',
      deactivation_date: null,
      archived_at: null,
      id: 'RandomInsititutionUserId',
      department: ['tore üksus'],
      email: 'random@random.ee',
      institution: {
        created_at: '2023-08-01T07:16:52.000000Z',
        updated_at: '2023-08-01T07:16:52.000000Z',
        id: 'InstitutionId',
        email: null,
        logo_url: null,
        name: 'Institutsiooni nimi',
        phone: null,
        short_name: null,
      },
      phone: '+37255555555',
      roles: [
        {
          created_at: '2023-08-01T07:16:52.000000Z',
          id: 'RandomRoleId',
          institution_id: 'InstitutionId',
          is_root: false,
          name: 'Random',
          privileges: ['DELETE_TAG'],
          updated_at: '2023-08-01T07:16:52.000000Z',
        },
      ],
      status: 'ACTIVE',
      user: {
        created_at: '2023-08-01T07:16:52.000000Z',
        updated_at: '2023-08-01T07:16:52.000000Z',
        forename: 'Eesnimi',
        surname: 'Perekonnanimi',
        id: 'RandomId',
        personal_identification_code: '39209022722',
      },
    },
    company_name: 'Random Company',
    prices: [],
    tags: [],
    skills: [],
    comment: 'Kommenteerime asju',
  },
}

interface SelectVendorsTableProps {
  // TODO: will actually be prices instead of vendors
  data?: Price[]
  paginationData?: ResponseMetaTypes
  hidden?: boolean
  selectedVendorsIds?: string[]
  handleFilterChange?: (value?: FilterFunctionType) => void
  handleSortingChange?: (value?: SortingFunctionType) => void
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

interface PricesTableRow {
  selected: string
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
  selectedVendorsIds = [],
}) => {
  const { t } = useTranslation()

  const { rolesFilters = [] } = useRolesFetch()
  const { tagsFilters = [] } = useFetchTags()
  const { classifierValuesFilters = [] } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  }) // TODO: save them to local state when API available?

  const selectedValues = useMemo(
    () =>
      isEmpty([...data, mockPrice])
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

  const tableData = useMemo(() => {
    return (
      map(
        [...data, mockPrice],
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
      ) || {}
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
    columnHelper.accessor('languageDirection', {
      header: () => t('label.language_direction'),
      cell: ({ getValue }) => {
        return <Tag label={getValue()} value />
      },
      footer: (info) => info.column.id,
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
        filterOption: { tag_id: tagsFilters },
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
    columnHelper.accessor('character_fee', {
      header: () => t('label.character_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('word_fee', {
      header: () => t('label.word_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('page_fee', {
      header: () => t('label.page_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minute_fee', {
      header: () => t('label.minute_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('hour_fee', {
      header: () => t('label.hour_fee'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('minimal_fee', {
      header: () => t('label.minimal_fee'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => `${getValue()}€`,
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
        onFiltersChange={handleFilterChange}
        onSortingChange={handleSortingChange}
        className={classes.tableContainer}
      />
    </Root>
  )
}

export default SelectVendorsTable
