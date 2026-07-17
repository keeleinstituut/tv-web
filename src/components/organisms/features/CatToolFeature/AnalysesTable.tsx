import { useQuery } from "@tanstack/react-query"
import { apiClient } from "api"
import { FC } from "react"

const getAnalyses = ({ queryKey }) => {
  const [_, params] = queryKey
  return apiClient.get('http://devbox.host:8000/cat2/api/analyses', params)
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