import { useQuery } from "@tanstack/react-query"
import { apiClient } from "api"
import { FC } from "react"
import { CAT2_API_BASE_URL } from "./constants"

const getAnalyses = ({ queryKey }) => {
  const [_, params] = queryKey
  return apiClient.get(`${CAT2_API_BASE_URL}/analyses`, params)
}

interface AnalysesTableProps {
  catProjectId: string
}

const AnalysesTable: FC<AnalysesTableProps> = (props) => {
  const { catProjectId } = props

  const catAnalysesQuery = useQuery({
    queryFn: getAnalyses,
    queryKey: ['catAnalyses', {
      project_id: catProjectId,
    }],
    enabled: !!catProjectId
  })

  return (
      <>
      </>
  )
}

export default AnalysesTable