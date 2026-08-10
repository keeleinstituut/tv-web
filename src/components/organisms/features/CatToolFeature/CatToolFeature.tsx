import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { SourceFile } from 'types/projects'
import Loader from 'components/atoms/Loader/Loader'
import AnalysesTable from './AnalysesTable'
import JobsTable from './JobsTable'
import TranslationMemoriesTable from './TranslationMemoriesTable'

import classes from './classes.module.scss'

interface CatToolFeatureProps {
  cat_metadata?: { catto_project_id?: string }
  destination_language_classifier_value?: { value: string }
  source_files?: SourceFile[]
}

const CatToolFeature: FC<CatToolFeatureProps> = (props) => {
  const { t } = useTranslation()
  const catProjectId = props?.cat_metadata?.catto_project_id

  if (!catProjectId) {
    return (
      <div className={classes.pendingContainer}>
        <Loader loading />
        <span>{t('projects.features.cat_tool_pending')}</span>
      </div>
    )
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
