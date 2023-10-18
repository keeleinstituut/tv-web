import { useQuery } from '@tanstack/react-query'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { CatAnalysis, SourceFile } from 'types/orders'

export interface AnalysisResponse {
  files: SourceFile[]
  jobs: { id: string; name: string; volume_analysis: CatAnalysis }[]
}

export const useCatAnalysisFetch = ({
  subOrderId: id,
}: {
  subOrderId?: string
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
