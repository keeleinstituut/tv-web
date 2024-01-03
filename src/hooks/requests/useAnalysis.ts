import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { downloadFile } from 'helpers'
import { CatAnalysis, SourceFile } from 'types/projects'

export interface AnalysisResponse {
  cat_files: SourceFile[]
  cat_jobs: { id: string; name: string; volume_analysis: CatAnalysis }[]
  analyzing_status: string
  setup_status: string
}

export const useCatAnalysisFetch = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const { data, isLoading } = useQuery<{ data: AnalysisResponse }>({
    enabled: !!id,
    queryKey: ['cat_analysis', id],
    queryFn: () => apiClient.get(`${endpoints.CAT_TOOL}/volume-analysis/${id}`),
  })

  return {
    cat_analysis: data?.data,
    isLoading,
  }
}

export const useDownloadCatAnalysisFetch = ({
  subProjectId: id,
}: {
  subProjectId?: string
}) => {
  const { isLoading, isSuccess, mutateAsync } = useMutation({
    mutationKey: ['cat_analysis', id],
    mutationFn: () =>
      apiClient.get(
        `${endpoints.CAT_TOOL}/download-volume-analysis/${id}`,
        {},
        { responseType: 'blob' }
      ),
    onSuccess: (data) => {
      downloadFile({
        data,
        fileName: 'analysis.txt',
      })
    },
  })

  return {
    downloadAnalysis: mutateAsync,
    isSuccess,
    isLoading,
  }
}
