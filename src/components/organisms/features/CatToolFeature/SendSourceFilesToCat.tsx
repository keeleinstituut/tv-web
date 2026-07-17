import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "api"
import Button, { SizeTypes } from "components/molecules/Button/Button"
import SmallTooltip from "components/molecules/SmallTooltip/SmallTooltip"
import { FC, useState } from "react"
import { CAT2_API_BASE_URL } from "./constants"
import { useCatJobs } from "./useCatJobs"

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

interface SendSourceFilesToCatProps {
  cattoProjectId?: string
  targetLocale?: string
  sourceFiles?: SelectableSourceFile[]
}

const SendSourceFilesToCat: FC<SendSourceFilesToCatProps> = ({
  cattoProjectId,
  targetLocale,
  sourceFiles,
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<
    Record<string, boolean>
  >({})
  const queryClient = useQueryClient()
  const catJobsQuery = useCatJobs(cattoProjectId)

  const existingSourceFileNames = new Set(
    (catJobsQuery.data?.data || [])
      .map((job) => job?.source_file?.file_name)
      .filter(Boolean)
  )

  const sendMutation = useMutation({
    mutationFn: async () => {
      const filesToSend = (sourceFiles || []).filter(
        (file) => selectedFileIds[file.id]
      )
      await Promise.all(
        filesToSend.map((file) =>
          createCattoJob({
            project_id: cattoProjectId as string,
            target_locale: targetLocale as string,
            source_file_url: file.url,
            source_file_name: file.file_name,
          })
        )
      )
    },
    onSuccess: () => {
      setSelectedFileIds({})
      queryClient.invalidateQueries({ queryKey: ['catJobs'] })
    },
  })

  if (!cattoProjectId) return null

  const hasSelection = Object.values(selectedFileIds).some(Boolean)

  return (
    <div>
      <h2>Source files</h2>
      {(sourceFiles || []).map((file) => (
        <div key={file.id}>
          <label>
            <input
              type="checkbox"
              checked={!!selectedFileIds[file.id]}
              onChange={(e) =>
                setSelectedFileIds((prev) => ({
                  ...prev,
                  [file.id]: e.currentTarget.checked,
                }))
              }
            />
            {file.file_name}
            <SmallTooltip
              hidden={!existingSourceFileNames.has(file.file_name)}
              tooltipContent="This file has already been sent to CAT tool"
            />
          </label>
        </div>
      ))}
      <Button
        size={SizeTypes.S}
        disabled={!hasSelection || !targetLocale}
        loading={sendMutation.isLoading}
        onClick={() => sendMutation.mutate()}
      >
        Send to CAT tool
      </Button>
    </div>
  )
}

export default SendSourceFilesToCat
