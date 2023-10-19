import { FC } from 'react'
import { includes, filter, isEmpty, get } from 'lodash'
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

  const isFirstTaskJobRevision =
    get(subOrder.assignments[0], 'feature') === 'job_revision'

  return (
    <Component
      {...subOrder}
      catSupported={
        feature === SubProjectFeatures.GeneralInformation
          ? !isEmpty(subOrder.features)
          : includes(subOrder.features, feature)
      }
      subOrderId={subOrder.id}
      feature={feature}
      assignments={filter(subOrder.assignments, { feature })}
      isFirstTaskJobRevision={isFirstTaskJobRevision}
    />
  )
}

export default Feature
