import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import { Root as Form } from '@radix-ui/react-form'
import Container from 'components/atoms/Container/Container'
import Loader from 'components/atoms/Loader/Loader'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import SelectionControlsInput, {
  DropdownSizeTypes,
} from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { useFetchStatistics } from 'hooks/requests/useStatistics'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { useFetchTags } from 'hooks/requests/useTags'
import { useTranslationOrderInstitutions } from 'hooks/requests/useInstitutions'
import { ClassifierValueType } from 'types/classifierValues'
import { StatisticsParams, StatisticsRow } from 'types/statistics'
import { formatCell, FormatCellContext } from './formatCell'

import classes from './classes.module.scss'

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

const DEFAULT_PARAMS: StatisticsParams = {
  type: 'projects_plain',
  timeframe: 'monthly',
  basis: 'created',
}

const parseInitialParams = (
  searchParams: URLSearchParams
): StatisticsParams => {
  const fromUrl = Object.fromEntries(searchParams.entries())

  const validEntries = DROPDOWNS.filter(
    ({ key, values }) => fromUrl[key] && values.includes(fromUrl[key])
  ).map(({ key }) => [key, fromUrl[key]])

  return {
    ...DEFAULT_PARAMS,
    ...Object.fromEntries(validEntries),
  } as StatisticsParams
}

const columnHelper = createColumnHelper<StatisticsRow>()

const Statistics: FC = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const [initialParams] = useState<StatisticsParams>(() =>
    parseInitialParams(searchParams)
  )

  const { rows, isLoading, isError, filters, handleFilterChange } =
    useFetchStatistics(initialParams, true)

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
        [...(languageValues ?? []), ...(projectTypeValues ?? [])].map(
          (cv) => [cv.id, cv.name]
        )
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
      Object.keys(rows[0] ?? {}).map((key) =>
        columnHelper.accessor(key, {
          header: () =>
            t(`statistics.columns.${key}` as 'statistics.columns.period'),
          cell: ({ getValue }) => formatCell(key, getValue(), ctx),
        })
      ) as ColumnDef<StatisticsRow>[],
    [rows, ctx, t]
  )

  return (
    <>
      <h1 className={classes.title}>{t('statistics.title')}</h1>

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
              DROPDOWNS.find((dropdown) => dropdown.key === 'type')
                ?.values ?? []
            ).map((value) => ({
              value,
              label: t(
                `statistics.options.grouping.${value}` as 'statistics.options.grouping.projects_plain'
              ),
            }))}
            onChange={(value) => {
              if (typeof value !== 'string') return
              handleFilterChange({ type: value })
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
                  handleFilterChange({ [key]: value })
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
        <DataTable
          data={rows}
          columns={columns}
          tableSize={TableSizeTypes.M}
          hidePagination
          isHorizontallyScrollable
        />
      )}
    </>
  )
}

export default Statistics
