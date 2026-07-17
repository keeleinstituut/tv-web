import { useQuery } from "@tanstack/react-query"
import { apiClient } from "api"
import { CAT2_API_BASE_URL } from "./constants"

export const getJobs = ({ queryKey }) => {
  const [_, params] = queryKey
  return apiClient.get(`${CAT2_API_BASE_URL}/jobs`, params)
}

export const useCatJobs = (catProjectId?: string) =>
  useQuery({
    queryFn: getJobs,
    queryKey: ['catJobs', {
      project_id: catProjectId,
    }],
    enabled: !!catProjectId
  })
