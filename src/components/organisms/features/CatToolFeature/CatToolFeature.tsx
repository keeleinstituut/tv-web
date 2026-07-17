import { FC } from "react"
import JobsTable from "./JobsTable"

interface CatToolFeatureProps {
  subProject: any
}

const CatToolFeature: FC<CatToolFeatureProps> = (props) => {
  const { subProject } = props

  const catProjectId = (props as any)?.cat_metadata?.catto_project_id

  return (
    <>
      <JobsTable catProjectId={catProjectId} />
    </>
  )
}

export default CatToolFeature