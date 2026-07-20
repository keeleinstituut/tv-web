import { ReactNode } from 'react'
import { TFunction } from 'i18next'
import dayjs from 'dayjs'
import { ProjectStatus } from 'types/projects'
import { StatisticsRow, StatisticsTimeframe } from 'types/statistics'

export interface FormatCellContext {
  t: TFunction
  timeframe: StatisticsTimeframe
  classifierMap: Record<string, string>
  tagMap: Record<string, string>
  institutionMap: Record<string, string>
}

const PERIOD_FORMAT: Record<StatisticsTimeframe, string> = {
  daily: 'DD.MM.YYYY',
  monthly: 'MM.YYYY',
  yearly: 'YYYY',
}

const RELATION_MAP_BY_KEY: Record<
  string,
  'classifierMap' | 'tagMap' | 'institutionMap'
> = {
  tag_id: 'tagMap',
  type_classifier_value_id: 'classifierMap',
  source_language_classifier_value_id: 'classifierMap',
  destination_language_classifier_value_id: 'classifierMap',
  assignee_institution_id: 'institutionMap',
}

export const formatCell = (
  key: string,
  value: StatisticsRow[string],
  ctx: FormatCellContext
): ReactNode => {
  const { t, timeframe } = ctx

  if (value === null || value === undefined) return '–'

  if (key === 'period') {
    return dayjs(value as string).format(PERIOD_FORMAT[timeframe])
  }

  if (key === 'is_verbal') {
    const isTrue =
      value === true || value === 't' || value === 1 || value === '1'
    return isTrue ? t('statistics.yes') : t('statistics.no')
  }

  if (key === 'status') {
    return t(`projects.status.${value as ProjectStatus}`)
  }

  const relationMapKey = RELATION_MAP_BY_KEY[key]
  if (relationMapKey) {
    const id = String(value)
    return ctx[relationMapKey][id] ?? id
  }

  if (key === 'total_price' || key === 'total_discount') {
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (key.endsWith('_count') || key.startsWith('volume_')) {
    return Number(value).toLocaleString()
  }

  return String(value)
}
