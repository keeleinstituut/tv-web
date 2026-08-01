import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ColumnDef,
  createColumnHelper,
  RowSelectionState,
} from "@tanstack/react-table"
import { apiClient } from "api"
import { AppearanceTypes } from "components/molecules/Button/Button"
import SmallTooltip from "components/molecules/SmallTooltip/SmallTooltip"
import Tag from "components/atoms/Tag/Tag"
import { CAT2_API_BASE_URL } from "components/organisms/features/CatToolFeature/constants"
import { useCatJobs } from "components/organisms/features/CatToolFeature/useCatJobs"
import DataTable, { TableSizeTypes } from "components/organisms/DataTable/DataTable"
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from "components/organisms/ModalBase/ModalBase"
import dayjs from "dayjs"
import { isEmpty } from "lodash"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CatJob, SourceFile } from "types/projects"
import { closeModal } from "../ModalRoot"
import { ConfirmationModalBaseProps } from "../ConfirmationModalBase/ConfirmationModalBase"
import classes from "./classes.module.scss"

type CatFileStatus = "new" | "sent" | "outdated"

const createCattoJob = (payload: {
  project_id: string
  target_locale: string
  source_file_url: string
  source_file_name: string
}) => apiClient.post(`${CAT2_API_BASE_URL}/jobs`, payload)

const columnHelper = createColumnHelper<SourceFile>()

const getLatestJobPerSourceFile = (jobs: CatJob[]) => {
  const byId = new Map<string, CatJob>()
  const byFileName = new Map<string, CatJob>()

  jobs.forEach((job) => {
    const sourceFile = job?.source_file
    if (!sourceFile) return

    const isNewer = (existing?: CatJob) =>
      !existing || dayjs(job.created_at).isAfter(dayjs(existing.created_at))

    if (sourceFile.id && isNewer(byId.get(sourceFile.id))) {
      byId.set(sourceFile.id, job)
    }
    if (sourceFile.file_name && isNewer(byFileName.get(sourceFile.file_name))) {
      byFileName.set(sourceFile.file_name, job)
    }
  })

  return { byId, byFileName }
}

const getCatFileStatus = (
  file: SourceFile,
  matchingJob?: CatJob
): { status: CatFileStatus; sentAt?: string } => {
  if (!matchingJob) return { status: "new" }
  const isOutdated = dayjs(file.updated_at).isAfter(dayjs(matchingJob.created_at))
  return { status: isOutdated ? "outdated" : "sent", sentAt: matchingJob.created_at }
}

export type AddCatJobFilesModalProps = {
  catProjectId: string
  targetLocale?: string
  sourceFiles?: SourceFile[]
} & ConfirmationModalBaseProps

const AddCatJobFilesModal: FC<AddCatJobFilesModalProps> = ({
  isModalOpen,
  catProjectId,
  targetLocale,
  sourceFiles,
}) => {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const queryClient = useQueryClient()
  const catJobsQuery = useCatJobs(catProjectId)

  const { byId: jobsBySourceFileId, byFileName: jobsBySourceFileName } = useMemo(
    () => getLatestJobPerSourceFile(catJobsQuery.data?.data || []),
    [catJobsQuery.data]
  )

  const getMatchingJob = (file: SourceFile) =>
    jobsBySourceFileId.get(file.id) ?? jobsBySourceFileName.get(file.file_name)

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
        header: t("label.file_name"),
        cell: ({ getValue }) => (
          <span className={classes.fileNameCell}>{getValue()}</span>
        ),
      }),
      columnHelper.accessor("updated_at", {
        header: t("label.updated_at"),
        cell: ({ getValue }) => dayjs(getValue()).format("DD.MM.YYYY HH:mm"),
      }),
      columnHelper.display({
        id: "status",
        header: t("label.status"),
        cell: ({ row }) => {
          const { status, sentAt } = getCatFileStatus(
            row.original,
            getMatchingJob(row.original)
          )
          const sentAtLabel = sentAt
            ? dayjs(sentAt).format("DD.MM.YYYY HH:mm")
            : undefined
          const tooltipContent =
            status === "outdated"
              ? t("cat_tool_feature.tooltip.updated_since_sent", {
                  date: sentAtLabel,
                })
              : status === "sent"
                ? t("cat_tool_feature.tooltip.sent_at", { date: sentAtLabel })
                : undefined

          return (
            <span className={classes.statusCell}>
              <Tag
                label={t(`cat_tool_feature.status.${status}`)}
                className={classes[status]}
                withBorder={status === "new"}
              />
              <SmallTooltip hidden={!tooltipContent} tooltipContent={tooltipContent} />
            </span>
          )
        },
      }),
    ] as ColumnDef<SourceFile>[],
    [jobsBySourceFileId, jobsBySourceFileName, t]
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
