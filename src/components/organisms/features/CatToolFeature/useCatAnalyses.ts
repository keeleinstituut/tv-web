import { useQuery } from "@tanstack/react-query"
import { apiClient } from "api"
import useFilters from "hooks/useFilters"
import { CAT2_API_BASE_URL } from "./constants"
import { CattoAnalysesResponse } from "./types"

const getAnalyses = ({ queryKey }) => {
  const [_, params] = queryKey
  return apiClient.get(`${CAT2_API_BASE_URL}/analyses`, params)
}

interface CatAnalysesFilters {
  project_id?: string
  per_page?: number
  page?: number
}

export const useCatAnalyses = (catProjectId?: string) => {
  const { filters, handlePaginationChange } = useFilters<CatAnalysesFilters>({
    project_id: catProjectId,
    per_page: 15,
  })

  const catAnalysesQuery = useQuery<CattoAnalysesResponse>({
    queryFn: getAnalyses,
    queryKey: ['catAnalyses', filters],
    enabled: !!catProjectId,
    keepPreviousData: true,
    refetchInterval: (data) => {
      const analyses = data?.data ?? []
      const isPending = analyses.some((analysis) => !analysis.results)
      return isPending ? 3000 : false
    },
  })

  return {
    analyses: catAnalysesQuery.data?.data ?? [],
    paginationData: catAnalysesQuery.data?.meta,
    handlePaginationChange,
    isLoading: catAnalysesQuery.isLoading,
  }
}
