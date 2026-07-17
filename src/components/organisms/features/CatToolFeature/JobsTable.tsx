import { useMutation, useQuery } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { apiClient } from "api"
import Button, { SizeTypes } from "components/molecules/Button/Button"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import { keys } from "lodash"
import { FC, useState } from "react"

const getJobs = ({ queryKey }) => {
  const [_, params] = queryKey
  return apiClient.get('http://devbox.host:8000/cat2/api/jobs', params)
}

const postAnalyses = async (params: any) => {
  return apiClient.post('http://devbox.host:8000/cat2/api/analyses', params)
}

const postPretranslate = async (params: any) => {
  return apiClient.post('http://devbox.host:8000/cat2/api/jobs/pretranslate', params)
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
}

const JobsTable: FC<JobsTableProps> = (props) => {
  const { catProjectId } = props
  const [rowSelection, setRowSelection] = useState({})

  const catJobsQuery = useQuery({
    queryFn: getJobs,
    queryKey: ['catJobs', {
      project_id: catProjectId,
    }],
    enabled: !!catProjectId
  })

  const analyseMutation = useMutation({
    mutationFn: postAnalyses
  })

  const pretranslateMutation = useMutation({
    mutationFn: postPretranslate
  })

  return (
      <>
        <DataTable
          data={catJobsQuery.data?.data || []}
          columns={jobTableColumns}
          tableSize={TableSizeTypes.M}
          // className={classes.filesListContainer}
          hidePagination
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={row => row.id}
          headComponent={
            <>
              <h1>Jobs</h1>
              <span>
                <Button
                  size={SizeTypes.S}
                  onClick={() => analyseMutation.mutate({ job_id: keys(rowSelection) })}
                >
                  Analüüsi
                </Button>
                <Button
                  size={SizeTypes.S}
                  onClick={() => pretranslateMutation.mutate({ job_ids: keys(rowSelection) })}
                >
                  Eeltõlgi
                </Button>
              </span>
            </>
          }
        />
      </>
  )
}

export default JobsTable