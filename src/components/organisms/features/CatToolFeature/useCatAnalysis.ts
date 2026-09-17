import { useQuery } from "@tanstack/react-query"
import { apiClient } from "api"
import { CAT2_API_BASE_URL } from "./constants"
import { CattoAnalysis } from "./types"

const getAnalysis = ({ queryKey }) => {
  const [_, analysisId] = queryKey
  return apiClient.get(`${CAT2_API_BASE_URL}/analyses/${analysisId}`)
}

export const useCatAnalysis = (analysisId?: string) => {
  const catAnalysisQuery = useQuery<{ data: CattoAnalysis }>({
    queryFn: getAnalysis,
    queryKey: ['catAnalysis', analysisId],
    enabled: !!analysisId,
    refetchInterval: (data) => (data?.data.status === 'pending' ? 3000 : false),
  })

  return {
    analysis: catAnalysisQuery.data?.data,
    isLoading: catAnalysisQuery.isLoading,
  }
}
