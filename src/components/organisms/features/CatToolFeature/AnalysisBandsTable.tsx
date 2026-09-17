import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { BandStats, CattoAnalysisResults } from "./types"
import classes from "./classes.module.scss"

export interface BandRow {
  key: string
  label: string
  stats: BandStats
  isTotal?: boolean
}

interface BandRowLabels {
  total: string
  repetitions: string
}

const BAND_ORDER: (keyof CattoAnalysisResults['bands'])[] = [
  'repetitions',
  'ice',
  'exact',
  'high_fuzzy',
  'medium_fuzzy',
  'low_fuzzy',
  'slight_fuzzy',
  'no_match',
]

export const buildBandRows = (
  bands: CattoAnalysisResults['bands'],
  total: BandStats,
  labels: BandRowLabels
): BandRow[] => {
  const bandLabels: Record<keyof CattoAnalysisResults['bands'], string> = {
    ice: '101%',
    exact: '100%',
    repetitions: labels.repetitions,
    high_fuzzy: '95-99%',
    medium_fuzzy: '85-94%',
    low_fuzzy: '75-84%',
    slight_fuzzy: '50-74%',
    no_match: '0-49%',
  }

  return [
    { key: 'total', label: labels.total, stats: total, isTotal: true },
    ...BAND_ORDER.map((key) => ({ key, label: bandLabels[key], stats: bands[key] })),
  ]
}

export const computeBandPercent = (row: BandRow, total: BandStats): number =>
  total.words > 0 ? (row.stats.words / total.words) * 100 : 0

const columnHelper = createColumnHelper<BandRow>()

interface AnalysisBandsTableProps {
  bands: CattoAnalysisResults['bands']
  total: BandStats
}

const AnalysisBandsTable: FC<AnalysisBandsTableProps> = ({ bands, total }) => {
  const { t } = useTranslation()

  const rows = buildBandRows(bands, total, {
    total: t('cat_tool_feature.analysis_details_modal.row.total'),
    repetitions: t('cat_tool_feature.analyses_table.band.repetitions'),
  })

  const columns = [
    columnHelper.accessor('label', {
      header: t('cat_tool_feature.analysis_details_modal.column.match_type'),
    }),
    columnHelper.accessor('stats.segments', {
      id: 'segments',
      header: t('cat_tool_feature.analysis_details_modal.column.segments'),
      cell: ({ getValue }) => getValue().toLocaleString(),
    }),
    columnHelper.accessor('stats.pages', {
      id: 'pages',
      header: t('cat_tool_feature.analysis_details_modal.column.pages'),
      cell: ({ getValue }) => getValue().toLocaleString(),
    }),
    columnHelper.accessor('stats.words', {
      id: 'words',
      header: t('cat_tool_feature.analysis_details_modal.column.words'),
      cell: ({ getValue }) => getValue().toLocaleString(),
    }),
    columnHelper.accessor('stats.chars', {
      id: 'chars',
      header: t('cat_tool_feature.analysis_details_modal.column.characters'),
      cell: ({ getValue }) => getValue().toLocaleString(),
    }),
    columnHelper.display({
      id: 'percent',
      header: t('cat_tool_feature.analysis_details_modal.column.percent'),
      cell: ({ row }) => `${computeBandPercent(row.original, total).toFixed(1)}%`,
    }),
  ] as ColumnDef<BandRow>[]

  const getRowStyles = (row: { original?: BandRow }) => {
    if (row.original?.isTotal) return { background: '#F0F0F2' }
    if (row.original?.stats.words === 0) return { opacity: 0.5 }
    return {}
  }

  return (
    <DataTable
      data={rows}
      columns={columns}
      tableSize={TableSizeTypes.S}
      getRowId={(row) => row.key}
      className={classes.bandsTable}
      getRowStyles={getRowStyles}
      hidePagination
    />
  )
}

export default AnalysisBandsTable
