import { FC } from 'react'
import { includes, filter } from 'lodash'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import GeneralInformationFeature from './GeneralInformationFeature/GeneralInformationFeature'
import TranslationFeature from './TranslationFeature/TranslationFeature'
import RevisionFeature from './RevisionFeature/RevisionFeature'
import OverviewFeature from './OverviewFeature/OverviewFeature'

interface FeatureProps {
  subOrder?: SubOrderDetail
  feature?: SubProjectFeatures
}

const Feature: FC<FeatureProps> = ({ feature, subOrder }) => {
  let Component = null

  switch (feature) {
    case 'general_information':
      Component = GeneralInformationFeature
      break
    case 'job_translation':
      Component = TranslationFeature
      break
    case 'job_revision':
      Component = RevisionFeature
      break
    case 'job_overview':
      Component = OverviewFeature
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
      catSupported={includes(subOrder.cat_features, feature)}
      subOrderId={subOrder.id}
      assignments={filter(subOrder.assignments, { feature })}
    />
  )
}

export default Feature
