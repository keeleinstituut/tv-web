import { FC } from 'react'
import { includes, filter, isEmpty } from 'lodash'
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

  return (
    <Component
      {...subOrder}
      catSupported={
        feature === SubProjectFeatures.GeneralInformation
          ? !isEmpty(subOrder.cat_features)
          : includes(subOrder.cat_features, feature)
      }
      subOrderId={subOrder.id}
      assignments={filter(subOrder.assignments, { feature })}
    />
  )
}

export default Feature
