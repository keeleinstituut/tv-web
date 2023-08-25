import { FC, useCallback, useState } from 'react'
import { map } from 'lodash'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import Assignment from 'components/molecules/Assignment/Assignment'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'

import classNames from 'classnames'

import classes from './classes.module.scss'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'

// TODO: check later looks pretty much the same as OverviewFeature and RevisionFeature
// TODO: this is WIP code for suborder view

type TranslationFeatureProps = Pick<
  SubOrderDetail,
  'assignments' | 'cat_jobs'
> & {
  catSupported?: boolean
}

const TranslationFeature: FC<TranslationFeatureProps> = ({
  catSupported,
  assignments,
  cat_jobs,
}) => {
  const { t } = useTranslation()
  const featureTabs = [
    {
      label: t('button.vendors'),
      id: FeatureTabs.Vendors,
    },
    {
      label: t('button.xliff'),
      id: FeatureTabs.Xliff,
    },
  ]
  const [activeTab, setActiveTab] = useState<string>(FeatureTabs.Vendors)

  const addVendor = useCallback(() => {
    // DO sth
  }, [])

  return (
    <Root>
      <FeatureHeaderSection
        {...{
          setActiveTab,
          activeTab,
          tabs: featureTabs,
          addVendor,
          catSupported,
        }}
      />
      <FeatureAssignments
        assignments={assignments}
        hidden={activeTab === FeatureTabs.Xliff}
      />
    </Root>
  )
}

export default TranslationFeature
