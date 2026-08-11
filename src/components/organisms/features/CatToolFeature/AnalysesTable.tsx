import { Root } from "@radix-ui/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Tag from "components/atoms/Tag/Tag"
import Button, { AppearanceTypes, SizeTypes } from "components/molecules/Button/Button"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import dayjs from "dayjs"
import { FC } from "react"
import classes from "./classes.module.scss"
import BandsCell from "./BandsCell"
import { CattoAnalysis } from "./types"
import { useCatAnalyses } from "./useCatAnalyses"
import ExpandableContentContainer from "components/molecules/ExpandableContentContainer/ExpandableContentContainer"
import { useTranslation } from "react-i18next"
import { ModalTypes, showModal } from "components/organisms/modals/ModalRoot"

const columnHelper = createColumnHelper<CattoAnalysis>()

interface AnalysesTableProps {
  catProjectId: string
  selectable?: boolean
  selectedAnalysisId?: string
  onSelect?: (analysis: CattoAnalysis) => void
}

const AnalysesTable: FC<AnalysesTableProps> = (props) => {
  const { catProjectId, selectable, selectedAnalysisId, onSelect } = props
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { analyses, paginationData, handlePaginationChange } = useCatAnalyses(catProjectId)

  const analysesTableColumns = [
    ...(selectable
      ? [
        columnHelper.display({
          id: 'select',
          header: '',
          cell: ({ row }) => (
            <input
              type="radio"
              name="cat-analysis-select"
              checked={row.original.id === selectedAnalysisId}
              disabled={row.original.status != 'done'}
              onChange={() => onSelect?.(row.original)}
            />
          ),
        })
      ]
    : []),
    columnHelper.accessor('created_at', {
      header: t('cat_tool_feature.analyses_table.column.created'),
      cell: ({ getValue }) => dayjs(getValue()).format('YYYY.MM.DD HH:mm'),
    }),
    columnHelper.accessor('job_analyses', {
      id: 'jobs_count',
      header: t('cat_tool_feature.analyses_table.column.jobs'),
      cell: ({ getValue }) => getValue().length,
    }),
    // columnHelper.accessor('translation_memories', {
    //   id: 'translation_memories',
    //   header: t('cat_tool_feature.analyses_table.column.translation_memories'),
    //   cell: ({ getValue }) => (
    //     <div className={classes.bandsCell}>
    //       {getValue().map((tm) => (
    //         <Tag key={tm.id} label={tm.name} value />
    //       ))}
    //     </div>
    //   ),
    // }),
    columnHelper.accessor('status', {
      header: t('cat_tool_feature.analyses_table.column.status'),
      cell: ({ getValue }) =>
        getValue() === 'done'
          ? t('cat_tool_feature.analyses_table.status_done')
          : t('cat_tool_feature.analyses_table.status_pending'),
    }),
    columnHelper.accessor('total', {
      id: 'total',
      header: t('cat_tool_feature.analyses_table.column.total_words'),
      cell: ({ getValue }) => getValue().words.toLocaleString(),
    }),
    columnHelper.accessor('bands', {
      id: 'new_words',
      header: t('cat_tool_feature.analyses_table.column.new_words'),
      cell: ({ getValue }) => getValue().no_match.words.toLocaleString(),
    }),
    // columnHelper.accessor('bands', {
    //   id: 'bands',
    //   header: t('cat_tool_feature.analyses_table.column.distribution'),
    //   cell: ({ getValue }) => <BandsCell bands={getValue()} />,
    // }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          onClick={() => {
            queryClient.setQueryData(['catAnalysis', row.original.id], { data: row.original })
            showModal(ModalTypes.CatAnalysisDetails, { analysisId: row.original.id, catProjectId })
          }}
        >
          {t('cat_tool_feature.analyses_table.view')}
        </Button>
      ),
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
          defaultPaginationData={{ per_page: 10 }}
          pageSizeOptions={[
            { label: '10', value: '10' },
            { label: '25', value: '25' },
            { label: '50', value: '50' },
          ]}
        />
      </Root>
    </ExpandableContentContainer>
  )
}

export default AnalysesTable
