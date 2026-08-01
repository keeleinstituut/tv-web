import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { apiClient } from "api"
import Button, { AppearanceTypes, SizeTypes } from "components/molecules/Button/Button"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import { keys } from "lodash"
import { FC, useMemo, useState } from "react"
import { CAT2_API_BASE_URL } from "./constants"
import { useCatJobs } from "./useCatJobs"
import ExpandableContentContainer from "components/molecules/ExpandableContentContainer/ExpandableContentContainer"
import classes from "./classes.module.scss"
import { useTranslation } from "react-i18next"
import { ModalTypes, showModal } from "components/organisms/modals/ModalRoot"
import { SourceFile } from "types/projects"
import dayjs from "dayjs"

const postAnalyses = async (params: any) => {
  return apiClient.post(`${CAT2_API_BASE_URL}/analyses`, params)
}

const postPretranslate = async (params: any) => {
  return apiClient.post(`${CAT2_API_BASE_URL}/jobs/pretranslate`, params)
}

const columnHelper = createColumnHelper<any>()

interface JobsTableProps {
  catProjectId: string
  targetLocale?: string
  sourceFiles?: SourceFile[]
}

const JobsTable: FC<JobsTableProps> = (props) => {
  const { catProjectId, targetLocale, sourceFiles } = props
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = useState({})
  const rowSelectionCount = useMemo(() => keys(rowSelection).length, [rowSelection])
  const queryClient = useQueryClient()

  const catJobsQuery = useCatJobs(catProjectId)

  const analyseMutation = useMutation({
    mutationFn: postAnalyses,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catAnalyses'] }),
  })

  const pretranslateMutation = useMutation({
    mutationFn: postPretranslate
  })

  const jobTableColumns = [
    columnHelper.accessor('id', {
      header: '',
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        return (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.currentTarget.checked)}
          />
        )
      },
    }),
    columnHelper.accessor('source_file.file_name', {
      header: t('cat_tool_feature.jobs_table.column.file'),
    }),
    columnHelper.accessor('xliff_file.file_name', {
      header: t('cat_tool_feature.jobs_table.column.xliff'),
      cell: ({ row }: { row: any }) => (
        <a target="_blank" href={`http://devbox.host:5173/jobs/${row.original.id}/translate`}>
          {row.original.xliff_file?.file_name || t('cat_tool_feature.jobs_table.open_in_editor')}
        </a>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: t('cat_tool_feature.jobs_table.column.created_at'),
      cell: ({ getValue }) => dayjs(getValue()).format('YYYY.MM.DD HH:mm'),
    }),
  ]

  return (
    <ExpandableContentContainer
      className={classes.expandableContainer}
      initialIsExpanded
      wrapContent
      leftComponent={
        <>
          <h3>{t('cat_tool_feature.jobs')}</h3>
        </>
      }
      rightComponent={
        <>
          <Button
            className={classes.mainButton}
            appearance={AppearanceTypes.Secondary}
            size={SizeTypes.S}
            disabled={rowSelectionCount == 0}
            onClick={() => analyseMutation.mutate({ job_id: keys(rowSelection) })}
          >
            {t('cat_tool_feature.jobs_table.analyse')}
          </Button>
          <Button
            className={classes.mainButton}
            appearance={AppearanceTypes.Secondary}
            size={SizeTypes.S}
            disabled={rowSelectionCount == 0}
            onClick={() => pretranslateMutation.mutate({ job_ids: keys(rowSelection) })}
          >
            {t('cat_tool_feature.jobs_table.pretranslate')}
          </Button>
          <Button
            className={classes.mainButton}
            size={SizeTypes.S}
            onClick={() =>
              showModal(ModalTypes.AddCatJobFiles, {
                catProjectId,
                targetLocale,
                sourceFiles,
              })
            }
          >
            {t('cat_tool_feature.jobs_table.add_files')}
          </Button>
        </>
      }
    >
      <DataTable
        data={catJobsQuery.data?.data || []}
        columns={jobTableColumns}
        tableSize={TableSizeTypes.M}
        getRowId={row => row.id}
        className={classes.translationMemoriesTable}
        hidePagination
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </ExpandableContentContainer>
  )
}

export default JobsTable