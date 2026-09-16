import { isEmpty, uniq } from 'lodash'
import dayjs from 'dayjs'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { ProjectStatus } from 'types/projects'
import { StatisticsFilters, StatisticsRow } from 'types/statistics'
import { FormatCellContext, RELATION_MAP_BY_KEY } from './formatCell'

export type ColumnKind =
  | 'period'
  | 'status'
  | 'is_verbal'
  | 'id'
  | 'text_enum'
  | 'numeric'
  | 'text'

const TEXT_ENUM_KEYS = new Set(['job_short_name'])

export const getColumnKind = (key: string): ColumnKind => {
  if (key === 'period') return 'period'
  if (key === 'status') return 'status'
  if (key === 'is_verbal') return 'is_verbal'
  if (key in RELATION_MAP_BY_KEY) return 'id'
  if (TEXT_ENUM_KEYS.has(key)) return 'text_enum'
  if (
    key.endsWith('_count') ||
    key.startsWith('volume_') ||
    key === 'total_price' ||
    key === 'total_discount'
  )
    return 'numeric'
  return 'text'
}

export const isSelectableFilterColumn = (kind: ColumnKind): boolean =>
  kind === 'id' ||
  kind === 'status' ||
  kind === 'is_verbal' ||
  kind === 'text_enum'

export const normalizeVerbal = (
  value: StatisticsRow[string]
): 'true' | 'false' => {
  const isTrue = value === true || value === 'true' || value === 1 || value === '1'
  return isTrue ? 'true' : 'false'
}

export const getFilterOptions = (
  key: string,
  rows: StatisticsRow[],
  ctx: FormatCellContext
): DropDownOptions[] => {
  const kind = getColumnKind(key)

  if (kind === 'is_verbal') {
    return [
      { value: 'true', label: ctx.t('statistics.is_verbal_true') },
      { value: 'false', label: ctx.t('statistics.is_verbal_false') },
    ]
  }

  const distinctValues = uniq(
    rows
      .map((row) => row[key])
      .filter((value) => value !== null && value !== undefined)
  )

  if (kind === 'status') {
    return distinctValues
      .map((value) => ({
        value: String(value),
        label: ctx.t(`projects.status.${value as ProjectStatus}`),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  if (kind === 'id') {
    const mapKey = RELATION_MAP_BY_KEY[key]
    return distinctValues
      .map((value) => {
        const id = String(value)
        return { value: id, label: ctx[mapKey][id] ?? id }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  if (kind === 'text_enum') {
    return distinctValues
      .map((value) => {
        const str = String(value)
        return { value: str, label: str }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }

  return []
}

export const filterRows = (
  rows: StatisticsRow[],
  filters: StatisticsFilters
): StatisticsRow[] => {
  if (isEmpty(rows)) return rows
  const columnKeys = Object.keys(rows[0])

  const activeFilters = columnKeys
    .flatMap((key) => {
      const kind = getColumnKind(key)
      if (!isSelectableFilterColumn(kind)) return []
      return [{ key, values: filters[key] as string[] | undefined }]
    })
    .filter(({ values }) => !isEmpty(values))

  const periodStartRaw = filters.period_start as string | undefined
  const periodEndRaw = filters.period_end as string | undefined
  const hasPeriodFilter =
    columnKeys.includes('period') && (periodStartRaw || periodEndRaw)
  const periodStart = periodStartRaw
    ? dayjs(periodStartRaw).valueOf()
    : undefined
  const periodEnd = periodEndRaw ? dayjs(periodEndRaw).valueOf() : undefined

  return rows.filter((row) => {
    const passesFilters = activeFilters.every(({ key, values }) => {
      const kind = getColumnKind(key)
      const rowValue =
        kind === 'is_verbal' ? normalizeVerbal(row[key]) : String(row[key])
      return (values as string[]).includes(rowValue)
    })
    if (!passesFilters) return false

    if (hasPeriodFilter) {
      const periodValue = dayjs(row.period as string).valueOf()
      if (periodStart !== undefined && periodValue < periodStart) return false
      if (periodEnd !== undefined && periodValue > periodEnd) return false
    }

    return true
  })
}

const getSortValue = (
  key: string,
  value: StatisticsRow[string],
  ctx: FormatCellContext
): number | string => {
  const kind = getColumnKind(key)

  if (kind === 'period') return dayjs(value as string).valueOf()
  if (kind === 'numeric') return Number(value)
  if (kind === 'is_verbal') return normalizeVerbal(value) === 'true' ? 1 : 0
  if (kind === 'status')
    return ctx.t(`projects.status.${value as ProjectStatus}`).toLowerCase()
  if (kind === 'id') {
    const mapKey = RELATION_MAP_BY_KEY[key]
    const id = String(value)
    return (ctx[mapKey][id] ?? id).toLowerCase()
  }
  return String(value).toLowerCase()
}

export const sortRows = (
  rows: StatisticsRow[],
  filters: StatisticsFilters,
  ctx: FormatCellContext
): StatisticsRow[] => {
  const sortBy = filters.sort_by
  const sortOrder = filters.sort_order
  if (!sortBy || !sortOrder || isEmpty(rows) || !(sortBy in rows[0]))
    return rows

  const direction = sortOrder === 'desc' ? -1 : 1

  return [...rows].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    const aIsNullish = aValue === null || aValue === undefined
    const bIsNullish = bValue === null || bValue === undefined
    if (aIsNullish && bIsNullish) return 0
    if (aIsNullish) return 1
    if (bIsNullish) return -1

    const aSort = getSortValue(sortBy, aValue, ctx)
    const bSort = getSortValue(sortBy, bValue, ctx)

    if (typeof aSort === 'number' && typeof bSort === 'number') {
      return (aSort - bSort) * direction
    }
    return String(aSort).localeCompare(String(bSort)) * direction
  })
}
