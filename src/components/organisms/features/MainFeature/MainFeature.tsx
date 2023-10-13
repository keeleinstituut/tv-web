import { FC, useCallback, useState } from 'react'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'
import FeatureCatJobs from 'components/molecules/FeatureCatJobs/FeatureCatJobs'

type MainFeatureProps = Pick<
  SubOrderDetail,
  | 'assignments'
  | 'source_language_classifier_value_id'
  | 'destination_language_classifier_value_id'
  | 'cat_analyzis'
  | 'cat_jobs'
> & {
  catSupported?: boolean
  projectDeadline?: string
  feature: SubProjectFeatures
  mt_enabled?: boolean
  project_id?: string
}

const MainFeature: FC<MainFeatureProps> = ({
  catSupported,
  feature,
  mt_enabled,
  project_id,
  ...rest
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
          addVendor:
            feature === SubProjectFeatures.JobOverview ? undefined : addVendor,
          catSupported,
          mt_enabled,
          project_id,
        }}
      />
      <FeatureAssignments
        hidden={activeTab === FeatureTabs.Xliff}
        catSupported={catSupported}
        {...rest}
      />
      <FeatureCatJobs hidden={activeTab === FeatureTabs.Vendors} {...rest} />
    </Root>
  )
}

export default MainFeature
