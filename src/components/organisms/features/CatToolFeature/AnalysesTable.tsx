import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Tag from "components/atoms/Tag/Tag"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import dayjs from "dayjs"
import { FC } from "react"
import classes from "./classes.module.scss"
import { CattoAnalysis, CattoAnalysisResults } from "./types"
import { useCatAnalyses } from "./useCatAnalyses"
import ExpandableContentContainer from "components/molecules/ExpandableContentContainer/ExpandableContentContainer"
import { useTranslation } from "react-i18next"

const BAND_LABELS: Record<keyof CattoAnalysisResults["bands"], string> = {
  ice: "101%",
  exact: "100%",
  repetitions: "Kordused",
  high_fuzzy: "95-99%",
  medium_fuzzy: "85-94%",
  low_fuzzy: "75-84%",
  slight_fuzzy: "50-74%",
  no_match: "Uus",
}

const columnHelper = createColumnHelper<CattoAnalysis>()

const analysesTableColumns = [
  columnHelper.accessor('created_at', {
    header: 'Loodud',
    cell: ({ getValue }) => dayjs(getValue()).format('YYYY.MM.DD HH:mm'),
  }),
  columnHelper.accessor('languages', {
    header: 'Keeled',
    cell: ({ getValue }) => {
      const { source, target } = getValue()
      return <Tag label={`${source.toUpperCase()} > ${target.toUpperCase()}`} value />
    },
  }),
  columnHelper.accessor('results', {
    id: 'status',
    header: 'Staatus',
    cell: ({ getValue }) => (getValue() ? 'Valmis' : 'Ootel'),
  }),
  columnHelper.accessor('results', {
    id: 'total',
    header: 'Sõnu kokku',
    cell: ({ getValue }) => getValue()?.total.words.toLocaleString() ?? '—',
  }),
  columnHelper.accessor('results', {
    id: 'new_words',
    header: 'Uusi sõnu',
    cell: ({ getValue }) => getValue()?.bands.no_match.words.toLocaleString() ?? '—',
  }),
  columnHelper.accessor('results', {
    id: 'bands',
    header: 'Jaotus',
    cell: ({ getValue }) => {
      const results = getValue()
      if (!results) return null
      return (
        <div className={classes.bandsCell}>
          {Object.entries(results.bands)
            .filter(([, stats]) => stats.words > 0)
            .map(([band, stats]) => (
              <Tag
                key={band}
                label={`${BAND_LABELS[band as keyof typeof BAND_LABELS]}: ${stats.words}`}
                value
              />
            ))}
        </div>
      )
    },
  }),
] as ColumnDef<CattoAnalysis>[]

interface AnalysesTableProps {
  catProjectId: string
}

const AnalysesTable: FC<AnalysesTableProps> = (props) => {
  const { catProjectId } = props
  const { t } = useTranslation()
  const { analyses, paginationData, handlePaginationChange } = useCatAnalyses(catProjectId)

  return (
    <ExpandableContentContainer
      className={classes.expandableContainer}
      initialIsExpanded
      wrapContent
      leftComponent={<h3>{t('cat_tool_feature.analyses')}</h3>}
    >
      <DataTable
        data={analyses}
        columns={analysesTableColumns}
        tableSize={TableSizeTypes.M}
        getRowId={(row) => row.id}
        className={classes.translationMemoriesTable}
        // paginationData={paginationData}
        // onPaginationChange={handlePaginationChange}
        // defaultPaginationData={{ per_page: 15 }}
        hidePagination
      />
    </ExpandableContentContainer>
  )
}

export default AnalysesTable
