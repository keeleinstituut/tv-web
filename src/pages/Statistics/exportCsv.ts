import { TFunction } from 'i18next'
import { downloadFile } from 'helpers'
import { StatisticsRow } from 'types/statistics'
import { FormatCellContext, formatCellValue } from './formatCell'

const CSV_SEPARATOR = ';'

const escapeCsvField = (value: string): string => {
  if (/[;"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export const exportStatisticsCsv = (
  rows: StatisticsRow[],
  ctx: FormatCellContext,
  t: TFunction
) => {
  if (rows.length === 0) return

  const columnKeys = Object.keys(rows[0])
  const headerRow = columnKeys
    .map((key) =>
      escapeCsvField(
        t(`statistics.columns.${key}` as 'statistics.columns.period')
      )
    )
    .join(CSV_SEPARATOR)

  const dataRows = rows.map((row) =>
    columnKeys
      .map((key) => escapeCsvField(formatCellValue(key, row[key], ctx)))
      .join(CSV_SEPARATOR)
  )

  const csvString = `${headerRow}\r\n${dataRows.join('\r\n')}`
  const blob = new Blob([csvString], { type: 'text/csv' })

  downloadFile({ data: blob, fileName: 'statistics.csv' })
}
