import { Root } from "@radix-ui/react-form"
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

const columnHelper = createColumnHelper<CattoAnalysis>()

interface AnalysesTableProps {
  catProjectId: string
}

const AnalysesTable: FC<AnalysesTableProps> = (props) => {
  const { catProjectId } = props
  const { t } = useTranslation()
  const { analyses, paginationData, handlePaginationChange } = useCatAnalyses(catProjectId)

  const bandLabels: Record<keyof CattoAnalysisResults["bands"], string> = {
    ice: "101%",
    exact: "100%",
    repetitions: t('cat_tool_feature.analyses_table.band.repetitions'),
    high_fuzzy: "95-99%",
    medium_fuzzy: "85-94%",
    low_fuzzy: "75-84%",
    slight_fuzzy: "50-74%",
    no_match: t('cat_tool_feature.analyses_table.band.no_match'),
  }

  const analysesTableColumns = [
    columnHelper.accessor('created_at', {
      header: t('cat_tool_feature.analyses_table.column.created'),
      cell: ({ getValue }) => dayjs(getValue()).format('YYYY.MM.DD HH:mm'),
    }),
    columnHelper.accessor('languages', {
      header: t('cat_tool_feature.analyses_table.column.languages'),
      cell: ({ getValue }) => {
        const { source, target } = getValue()
        return <Tag label={`${source.toUpperCase()} > ${target.toUpperCase()}`} value />
      },
    }),
    columnHelper.accessor('results', {
      id: 'status',
      header: t('cat_tool_feature.analyses_table.column.status'),
      cell: ({ getValue }) =>
        getValue()
          ? t('cat_tool_feature.analyses_table.status_done')
          : t('cat_tool_feature.analyses_table.status_pending'),
    }),
    columnHelper.accessor('results', {
      id: 'total',
      header: t('cat_tool_feature.analyses_table.column.total_words'),
      cell: ({ getValue }) => getValue()?.total.words.toLocaleString() ?? '—',
    }),
    columnHelper.accessor('results', {
      id: 'new_words',
      header: t('cat_tool_feature.analyses_table.column.new_words'),
      cell: ({ getValue }) => getValue()?.bands.no_match.words.toLocaleString() ?? '—',
    }),
    columnHelper.accessor('results', {
      id: 'bands',
      header: t('cat_tool_feature.analyses_table.column.distribution'),
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
                  label={`${bandLabels[band as keyof typeof bandLabels]}: ${stats.words}`}
                  value
                />
              ))}
          </div>
        )
      },
    }),
  ] as ColumnDef<CattoAnalysis>[]

  return (
    <ExpandableContentContainer
      className={classes.expandableContainer}
      initialIsExpanded
      wrapContent
      leftComponent={<h3>{t('cat_tool_feature.analyses')}</h3>}
    >
      <Root onSubmit={(e) => e.preventDefault()}>
        <DataTable
          data={analyses}
          columns={analysesTableColumns}
          tableSize={TableSizeTypes.M}
          getRowId={(row) => row.id}
          className={classes.translationMemoriesTable}
          paginationData={paginationData}
          onPaginationChange={handlePaginationChange}
          defaultPaginationData={{ per_page: 15 }}
          pageSizeOptions={[
            { label: '15', value: '15' },
            { label: '50', value: '50' },
          ]}
        />
      </Root>
    </ExpandableContentContainer>
  )
}

export default AnalysesTable
