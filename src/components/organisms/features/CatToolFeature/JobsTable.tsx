import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { apiClient } from "api"
import Button, { SizeTypes } from "components/molecules/Button/Button"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import { keys } from "lodash"
import { FC, useMemo, useState } from "react"
import { CAT2_API_BASE_URL } from "./constants"
import { useCatJobs } from "./useCatJobs"
import ExpandableContentContainer from "components/molecules/ExpandableContentContainer/ExpandableContentContainer"
import classes from "./classes.module.scss"
import { useTranslation } from "react-i18next"
import { ModalTypes, showModal } from "components/organisms/modals/ModalRoot"

const postAnalyses = async (params: any) => {
  return apiClient.post(`${CAT2_API_BASE_URL}/analyses`, params)
}

const postPretranslate = async (params: any) => {
  return apiClient.post(`${CAT2_API_BASE_URL}/jobs/pretranslate`, params)
}

const columnHelper = createColumnHelper<any>()

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
  {
    accessorKey: "source_file.file_name",
    header: "File",
  },
  {
    accessorKey: "xliff_file.file_name",
    header: "Xliff",
    cell: ({ row }) => (
      <a target="_blank" href={`http://devbox.host:5173/jobs/${row.original.id}/translate`}>
        {row.original.xliff_file?.file_name || 'Open in editor'}
      </a>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created at",
  },
]

interface JobsTableProps {
  catProjectId: string
  targetLocale?: string
  sourceFiles?: { id: string | number; file_name: string; url: string }[]
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

  return (
    <ExpandableContentContainer
      className={classes.expandableContainer}
      initialIsExpanded
      wrapContent
      leftComponent={
        <>
          <h3>{t('cat_tool_feature.jobs')}</h3>
          <Button
            className={classes.mainButton}
            size={SizeTypes.S}
            disabled={rowSelectionCount == 0}
            onClick={() => analyseMutation.mutate({ job_id: keys(rowSelection) })}
          >
            Analüüsi
          </Button>
          <Button
            className={classes.mainButton}
            size={SizeTypes.S}
            disabled={rowSelectionCount == 0}
            onClick={() => pretranslateMutation.mutate({ job_ids: keys(rowSelection) })}
          >
            Eeltõlgi
          </Button>
        </>
      }
      rightComponent={
        <>
          <Button
            size={SizeTypes.S}
            onClick={() =>
              showModal(ModalTypes.AddCatJobFiles, {
                catProjectId,
                targetLocale,
                sourceFiles,
              })
            }
          >
            Lisa failid
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