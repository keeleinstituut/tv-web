import {
  FC,
  createContext,
  startTransition,
  useContext,
  useDeferredValue,
  useMemo,
} from 'react'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { Root as Form } from '@radix-ui/react-form'
import Container from 'components/atoms/Container/Container'
import Loader from 'components/atoms/Loader/Loader'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import {
  TableSelectFilter,
  TableDateRangeFilter,
  DateRangeGranularity,
} from 'components/organisms/TableHeaderGroup/TableHeaderGroup'
import SelectionControlsInput, {
  DropDownOptions,
  DropdownSizeTypes,
} from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { useFetchStatistics } from 'hooks/requests/useStatistics'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { useFetchTags } from 'hooks/requests/useTags'
import { useTranslationOrderInstitutions } from 'hooks/requests/useInstitutions'
import { ClassifierValueType } from 'types/classifierValues'
import {
  StatisticsFilters,
  StatisticsParams,
  StatisticsRow,
  StatisticsTimeframe,
} from 'types/statistics'
import { formatCell, FormatCellContext } from './formatCell'
import { exportStatisticsCsv } from './exportCsv'
import {
  ColumnKind,
  getColumnKind,
  getFilterOptions,
  filterRows,
  isSelectableFilterColumn,
  sortRows,
} from './tableHelpers'

import classes from './classes.module.scss'

const GRANULARITY_BY_TIMEFRAME: Record<
  StatisticsTimeframe,
  DateRangeGranularity
> = {
  daily: 'day',
  monthly: 'month',
  yearly: 'year',
}

const DROPDOWNS: { key: keyof StatisticsParams; values: string[] }[] = [
  {
    key: 'type',
    values: [
      'projects_plain',
      'projects_extended',
      'subprojects_plain',
      'subprojects_extended',
      'assignments_plain',
      'assignments_extended',
    ],
  },
  { key: 'timeframe', values: ['daily', 'monthly', 'yearly'] },
  { key: 'basis', values: ['created', 'completed'] },
]

const DEFAULT_PARAMS: StatisticsFilters = {
  type: 'projects_plain',
  timeframe: 'monthly',
  basis: 'created',
}

const StatisticsFiltersContext =
  createContext<StatisticsFilters>(DEFAULT_PARAMS)

const LOCAL_MULTI_FILTER_KEYS = [
  'status',
  'job_short_name',
  'tag_id',
  'type_classifier_value_id',
  'source_language_classifier_value_id',
  'destination_language_classifier_value_id',
  'assignee_institution_id',
  'is_verbal',
] as const

const LOCAL_SCALAR_FILTER_KEYS = [
  'sort_by',
  'sort_order',
  'period_start',
  'period_end',
] as const

const LOCAL_FILTER_KEYS = [
  ...LOCAL_MULTI_FILTER_KEYS,
  ...LOCAL_SCALAR_FILTER_KEYS,
] as const

const clearedLocalFilters = () =>
  Object.fromEntries(LOCAL_FILTER_KEYS.map((key) => [key, '']))

const parseInitialParams = (
  searchParams: URLSearchParams
): StatisticsFilters => {
  const fromUrl = Object.fromEntries(searchParams.entries())

  const validEntries = DROPDOWNS.filter(
    ({ key, values }) => fromUrl[key] && values.includes(fromUrl[key])
  ).map(({ key }) => [key, fromUrl[key]])

  const scalarLocalEntries = LOCAL_SCALAR_FILTER_KEYS.filter(
    (key) => fromUrl[key]
  ).map((key) => [key, fromUrl[key]])

  const multiLocalEntries = LOCAL_MULTI_FILTER_KEYS.map((key) => [
    key,
    searchParams.getAll(key),
  ]).filter(([, values]) => !isEmpty(values))

  return {
    ...DEFAULT_PARAMS,
    ...Object.fromEntries(validEntries),
    ...Object.fromEntries(scalarLocalEntries),
    ...Object.fromEntries(multiLocalEntries),
  } as StatisticsFilters
}

const columnHelper = createColumnHelper<StatisticsRow>()

type StatisticsSelectFilterHeaderProps = {
  filterKey: string
  kind: ColumnKind
  options: DropDownOptions[]
}

const StatisticsSelectFilterHeader = ({
  filterKey,
  kind,
  options,
}: StatisticsSelectFilterHeaderProps) => {
  const liveFilters = useContext(StatisticsFiltersContext)
  return (
    <TableSelectFilter
      filterKey={filterKey}
      options={options}
      value={(liveFilters[filterKey] as string[]) ?? []}
      showSearch={kind === 'id'}
    />
  )
}

type StatisticsPeriodFilterHeaderProps = {
  fromLabel: string
  toLabel: string
}

const StatisticsPeriodFilterHeader = ({
  fromLabel,
  toLabel,
}: StatisticsPeriodFilterHeaderProps) => {
  const liveFilters = useContext(StatisticsFiltersContext)
  return (
    <TableDateRangeFilter
      startKey="period_start"
      endKey="period_end"
      granularity={GRANULARITY_BY_TIMEFRAME[liveFilters.timeframe]}
      fromLabel={fromLabel}
      toLabel={toLabel}
      value={{
        start: liveFilters.period_start as string | undefined,
        end: liveFilters.period_end as string | undefined,
      }}
    />
  )
}

const Statistics: FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const initialParams = parseInitialParams(searchParams)

  const {
    rows,
    isLoading,
    isError,
    filters,
    handleFilterChange,
    handleSortingChange,
  } = useFetchStatistics(initialParams, true)

  const deferredFilters = useDeferredValue(filters)

  const { classifierValues: languageValues } = useClassifierValuesFetch({
    type: ClassifierValueType.Language,
  })
  const { classifierValues: projectTypeValues } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })
  const { tags } = useFetchTags()
  const { institutions } = useTranslationOrderInstitutions({ per_page: 10000 })

  const classifierMap = useMemo(
    () =>
      Object.fromEntries(
        [...(languageValues ?? []), ...(projectTypeValues ?? [])].map((cv) => [
          cv.id,
          cv.name,
        ])
      ),
    [languageValues, projectTypeValues]
  )

  const tagMap = useMemo(
    () => Object.fromEntries((tags ?? []).map((tag) => [tag.id, tag.name])),
    [tags]
  )

  const institutionMap = useMemo(() => {
    const map: Record<string, string> = {}
    institutions.forEach((institution) => {
      if (institution.name) map[institution.id] = institution.name
    })
    return map
  }, [institutions])

  const ctx: FormatCellContext = useMemo(
    () => ({
      t,
      timeframe: filters.timeframe,
      classifierMap,
      tagMap,
      institutionMap,
    }),
    [t, filters.timeframe, classifierMap, tagMap, institutionMap]
  )

  const columns = useMemo(
    () =>
      Object.keys(rows[0] ?? {}).map((key) => {
        const kind = getColumnKind(key)
        const options = isSelectableFilterColumn(kind)
          ? getFilterOptions(key, rows, ctx)
          : []

        const FilteringComponent = isSelectableFilterColumn(kind)
          ? () => (
              <StatisticsSelectFilterHeader
                filterKey={key}
                kind={kind}
                options={options}
              />
            )
          : kind === 'period'
            ? () => (
                <StatisticsPeriodFilterHeader
                  fromLabel={t('statistics.filter.from')}
                  toLabel={t('statistics.filter.to')}
                />
              )
            : undefined

        return columnHelper.accessor(key, {
          header: () =>
            t(`statistics.columns.${key}` as 'statistics.columns.period'),
          cell: ({ getValue }) => formatCell(key, getValue(), ctx),
          meta: {
            sortingOption: ['asc', 'desc'],
            sortingParameterName: key,
            currentSorting:
              filters.sort_by === key
                ? (filters.sort_order as 'asc' | 'desc' | undefined)
                : undefined,
            ...(FilteringComponent ? { FilteringComponent } : {}),
          },
        })
      }) as ColumnDef<StatisticsRow>[],
    [rows, ctx, t, filters.sort_by, filters.sort_order]
  )

  const displayedRows = useMemo(
    () => sortRows(filterRows(rows, deferredFilters), deferredFilters, ctx),
    [rows, deferredFilters, ctx]
  )

  return (
    <>
      <div className={classes.header}>
        <h1 className={classes.title}>{t('statistics.title')}</h1>
        <Button
          appearance={AppearanceTypes.Secondary}
          onClick={() => exportStatisticsCsv(displayedRows, ctx, t)}
          disabled={isLoading || isError || displayedRows.length === 0}
        >
          {t('button.export_csv')}
        </Button>
      </div>

      <Container className={classes.parametersContainer}>
        <h4 className={classes.parametersHeading}>
          {t('statistics.parameters')}
        </h4>
        <Form className={classes.parameters}>
          <SelectionControlsInput
            name="grouping"
            ariaLabel={t('statistics.select.grouping')}
            label={t('statistics.select.grouping')}
            hideTags
            dropdownSize={DropdownSizeTypes.L}
            optionClassName={classes.wrappingOption}
            value={filters.type}
            rules={{ required: true }}
            options={(
              DROPDOWNS.find((dropdown) => dropdown.key === 'type')?.values ??
              []
            ).map((value) => ({
              value,
              label: t(
                `statistics.options.grouping.${value}` as 'statistics.options.grouping.projects_plain'
              ),
            }))}
            onChange={(value) => {
              if (typeof value !== 'string') return
              handleFilterChange({
                type: value,
                ...clearedLocalFilters(),
              })
            }}
          />
          {DROPDOWNS.filter(
            (
              dropdown
            ): dropdown is { key: 'timeframe' | 'basis'; values: string[] } =>
              dropdown.key === 'timeframe' || dropdown.key === 'basis'
          ).map(({ key, values }) => (
            <SelectionControlsInput
              key={key}
              name={key}
              ariaLabel={t(`statistics.select.${key}`)}
              label={t(`statistics.select.${key}`)}
              hideTags
              dropdownSize={DropdownSizeTypes.L}
              optionClassName={classes.wrappingOption}
              value={filters[key]}
              rules={{ required: true }}
              options={values.map((value) => ({
                value,
                label: t(
                  `statistics.options.${key}.${value}` as 'statistics.options.basis.created'
                ),
              }))}
              onChange={(value) => {
                if (typeof value === 'string' && values.includes(value)) {
                  handleFilterChange({
                    [key]: value,
                    ...(key === 'timeframe'
                      ? { period_start: '', period_end: '' }
                      : {}),
                  })
                }
              }}
            />
          ))}
        </Form>
      </Container>

      {isLoading ? (
        <Loader loading />
      ) : isError ? (
        <Container className={classes.container}>
          <p>{t('statistics.load_error')}</p>
        </Container>
      ) : rows.length === 0 ? (
        <Container className={classes.container}>
          <p>{t('statistics.no_data')}</p>
        </Container>
      ) : (
        <StatisticsFiltersContext.Provider value={filters}>
          <Form onSubmit={(e) => e.preventDefault()}>
            <DataTable
              key={[
                filters.type,
                filters.timeframe,
                filters.basis,
                ...LOCAL_FILTER_KEYS.map((key) => {
                  const value = filters[key]
                  return Array.isArray(value)
                    ? value.join(',')
                    : String(value ?? '')
                }),
              ].join('|')}
              data={displayedRows}
              columns={columns}
              tableSize={TableSizeTypes.M}
              defaultPaginationData={{ per_page: 15 }}
              isHorizontallyScrollable
              onFiltersChange={(next) => {
                startTransition(() => handleFilterChange(next))
              }}
              onSortingChange={(next) => {
                startTransition(() => handleSortingChange(next))
              }}
            />
            {displayedRows.length === 0 && (
              <Container className={classes.container}>
                <p>{t('statistics.no_filtered_results')}</p>
              </Container>
            )}
          </Form>
        </StatisticsFiltersContext.Provider>
      )}
    </>
  )
}

export default Statistics
