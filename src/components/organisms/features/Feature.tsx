import { FC } from 'react'
import { includes, filter, isEmpty } from 'lodash'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import GeneralInformationFeature from './GeneralInformationFeature/GeneralInformationFeature'
import TranslationFeature from './TranslationFeature/TranslationFeature'
import RevisionFeature from './RevisionFeature/RevisionFeature'
import OverviewFeature from './OverviewFeature/OverviewFeature'

// TODO: this is WIP code for suborder view

interface FeatureProps {
  subOrder?: SubOrderDetail
  feature?: SubProjectFeatures
  index?: number
}

const Feature: FC<FeatureProps> = ({ feature, subOrder, index }) => {
  let Component = null

  switch (feature) {
    case SubProjectFeatures.GeneralInformation:
      Component = GeneralInformationFeature
      break
    case SubProjectFeatures.JobTranslation:
      Component = TranslationFeature
      break
    case SubProjectFeatures.JobRevision:
      Component = RevisionFeature
      break
    case SubProjectFeatures.JobOverview:
      Component = OverviewFeature
      break

    default:
      break
  }

  if (!Component || !subOrder || !feature) {
    return <></>
  }

  // from subOrder: cat_features, id, assignments

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
      index={index}
    />
  )
}

export default Feature
