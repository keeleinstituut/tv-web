import { FC } from "react"
import AnalysesTable from "./AnalysesTable"
import JobsTable from "./JobsTable"
import TranslationMemoriesTable from "./TranslationMemoriesTable"

interface CatToolFeatureProps {
  cat_metadata?: { catto_project_id?: string }
  destination_language_classifier_value?: { value: string }
  source_files?: { id: string | number; file_name: string; url: string }[]
}

const CatToolFeature: FC<CatToolFeatureProps> = (props) => {
  const catProjectId = props?.cat_metadata?.catto_project_id

  if (!catProjectId) {
    return null
  }

  return (
    <>
      <JobsTable
        catProjectId={catProjectId}
        targetLocale={props?.destination_language_classifier_value?.value}
        sourceFiles={props?.source_files}
      />
      <AnalysesTable catProjectId={catProjectId} />
      <TranslationMemoriesTable catProjectId={catProjectId} />
    </>
  )
}

export default CatToolFeature