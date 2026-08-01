import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ColumnDef,
  createColumnHelper,
  RowSelectionState,
} from "@tanstack/react-table"
import { apiClient } from "api"
import { AppearanceTypes } from "components/molecules/Button/Button"
import SmallTooltip from "components/molecules/SmallTooltip/SmallTooltip"
import { CAT2_API_BASE_URL } from "components/organisms/features/CatToolFeature/constants"
import { useCatJobs } from "components/organisms/features/CatToolFeature/useCatJobs"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from "components/organisms/ModalBase/ModalBase"
import { isEmpty } from "lodash"
import { FC, useMemo, useState } from "react"
import { closeModal } from "../ModalRoot"
import { ConfirmationModalBaseProps } from "../ConfirmationModalBase/ConfirmationModalBase"
import classes from "./classes.module.scss"

interface SelectableSourceFile {
  id: string | number
  file_name: string
  url: string
}

const createCattoJob = (payload: {
  project_id: string
  target_locale: string
  source_file_url: string
  source_file_name: string
}) => apiClient.post(`${CAT2_API_BASE_URL}/jobs`, payload)

const columnHelper = createColumnHelper<SelectableSourceFile>()

export type AddCatJobFilesModalProps = {
  catProjectId: string
  targetLocale?: string
  sourceFiles?: SelectableSourceFile[]
} & ConfirmationModalBaseProps

const AddCatJobFilesModal: FC<AddCatJobFilesModalProps> = ({
  isModalOpen,
  catProjectId,
  targetLocale,
  sourceFiles,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const queryClient = useQueryClient()
  const catJobsQuery = useCatJobs(catProjectId)

  const existingSourceFileNames = new Set(
    (catJobsQuery.data?.data || [])
      .map((job) => job?.source_file?.file_name)
      .filter(Boolean)
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.currentTarget.checked)}
          />
        ),
      }),
      columnHelper.accessor("file_name", {
        header: "Fail",
        cell: ({ getValue }) => (
          <span className={classes.fileNameCell}>
            {getValue()}
            <SmallTooltip
              hidden={!existingSourceFileNames.has(getValue())}
              tooltipContent="Fail on juba CAT tööriista saadetud"
            />
          </span>
        ),
      }),
    ] as ColumnDef<SelectableSourceFile>[],
    [existingSourceFileNames]
  )

  const sendMutation = useMutation({
    mutationFn: async () => {
      const filesToSend = (sourceFiles || []).filter(
        (file) => rowSelection[String(file.id)]
      )
      await Promise.all(
        filesToSend.map((file) =>
          createCattoJob({
            project_id: catProjectId,
            target_locale: targetLocale as string,
            source_file_url: file.url,
            source_file_name: file.file_name,
          })
        )
      )
    },
    onSuccess: () => {
      setRowSelection({})
      queryClient.invalidateQueries({ queryKey: ['catJobs'] })
      closeModal()
    },
  })

  const hasSelection = !isEmpty(rowSelection)

  return (
    <ModalBase
      title="Lisa failid"
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      innerWrapperClassName={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Medium}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          onClick: () => {
            setRowSelection({})
            closeModal()
          },
          children: "Loobu",
        },
        {
          appearance: AppearanceTypes.Primary,
          children: "Saada CAT tööriista",
          loading: sendMutation.isLoading,
          disabled: !hasSelection || !targetLocale,
          onClick: () => sendMutation.mutate(),
        },
      ]}
    >
      <DataTable
        data={sourceFiles || []}
        columns={columns}
        tableSize={TableSizeTypes.S}
        getRowId={(file) => String(file.id)}
        className={classes.filesTable}
        hidePagination
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </ModalBase>
  )
}

export default AddCatJobFilesModal
