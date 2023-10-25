import { FC } from 'react'
import { includes, filter, isEmpty, map } from 'lodash'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import GeneralInformationFeature from './GeneralInformationFeature/GeneralInformationFeature'
import MainFeature from './MainFeature/MainFeature'
// TODO: this is WIP code for suborder view

interface FeatureProps {
  subOrder?: SubOrderDetail
  feature?: SubProjectFeatures
  index?: number
  projectDeadline?: string
}

const Feature: FC<FeatureProps> = ({ feature, subOrder }) => {
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

  if (!Component || !subOrder || !feature) {
    return <></>
  }

  const filteredAssignments = filter(
    subOrder.assignments,
    ({ job_definition }) => feature === job_definition.job_key
  )

  const cat_assignments = filter(
    subOrder.assignments,
    ({ job_definition }) => job_definition.linking_with_cat_tool_jobs_enabled
  )

  const cat_features = map(
    cat_assignments,
    ({ job_definition }) => job_definition.job_key
  )

  console.log('subOrder', subOrder)

  return (
    <Component
      {...subOrder}
      catSupported={
        feature === SubProjectFeatures.GeneralInformation
          ? !isEmpty(cat_features)
          : includes(cat_features, feature)
      }
      subOrderId={subOrder.id}
      feature={feature}
      assignments={filteredAssignments}
    />
  )
}

export default Feature
