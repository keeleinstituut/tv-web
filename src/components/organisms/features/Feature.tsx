import { FC } from 'react'
import { filter } from 'lodash'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import GeneralInformationFeature from './GeneralInformationFeature/GeneralInformationFeature'
import MainFeature from './MainFeature/MainFeature'
import { ClassifierValue } from 'types/classifierValues'
// TODO: this is WIP code for suborder view

interface FeatureProps {
  subOrder?: SubOrderDetail
  feature?: SubProjectFeatures
  index?: number
  projectDeadline?: string
  projectDomain?: ClassifierValue
}

const Feature: FC<FeatureProps> = ({ feature, subOrder, projectDomain }) => {
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

  return (
    <Component
      {...subOrder}
      catSupported={
        subOrder?.project?.type_classifier_value?.project_type_config
          ?.cat_tool_enabled
      }
      subOrderId={subOrder.id}
      projectDomain={projectDomain}
      feature={feature}
      assignments={filter(subOrder.assignments, { feature })}
    />
  )
}

export default Feature
