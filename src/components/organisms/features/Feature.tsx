import { FC } from 'react'
import { includes, filter, isEmpty, map } from 'lodash'
import { SubProjectDetail, SubProjectFeatures } from 'types/projects'
import GeneralInformationFeature from './GeneralInformationFeature/GeneralInformationFeature'
import MainFeature from './MainFeature/MainFeature'
import { ClassifierValue } from 'types/classifierValues'

interface FeatureProps {
  subProject?: SubProjectDetail
  feature?: SubProjectFeatures
  index?: number
  projectDomain?: ClassifierValue
}

const Feature: FC<FeatureProps> = ({ feature, subProject, projectDomain }) => {
  let Component = null

  switch (feature) {
    case SubProjectFeatures.GeneralInformation:
      Component = GeneralInformationFeature
      break
    case SubProjectFeatures.JobTranslation:
    case SubProjectFeatures.JobRevision:
    case SubProjectFeatures.JobOverview:
      Component = MainFeature
      break

    default:
      break
  }

  if (!Component || !subProject || !feature) {
    return <></>
  }

  const filteredAssignments = filter(
    subProject.assignments,
    ({ job_definition }) => feature === job_definition.job_key
  )

  const cat_assignments = filter(
    subProject.assignments,
    ({ job_definition }) => job_definition.linking_with_cat_tool_jobs_enabled
  )

  const cat_features = map(
    cat_assignments,
    ({ job_definition }) => job_definition.job_key
  )

  return (
    <Component
      {...subProject}
      catSupported={
        feature === SubProjectFeatures.GeneralInformation
          ? !isEmpty(cat_features)
          : includes(cat_features, feature)
      }
      subProjectId={subProject.id}
      projectDomain={projectDomain}
      feature={feature}
      assignments={filteredAssignments}
    />
  )
}

export default Feature
