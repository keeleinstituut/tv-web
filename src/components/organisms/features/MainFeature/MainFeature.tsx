import { FC, useCallback, useState } from 'react'
import { SubOrderDetail } from 'types/orders'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'

type MainFeatureProps = Pick<
  SubOrderDetail,
  | 'assignments'
  | 'source_language_classifier_value_id'
  | 'destination_language_classifier_value_id'
  | 'cat_analyzis'
  // | 'cat_jobs'
> & {
  catSupported?: boolean
  projectDeadline?: string
}

const MainFeature: FC<MainFeatureProps> = ({ catSupported, ...rest }) => {
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
        hidden={activeTab === FeatureTabs.Xliff}
        catSupported={catSupported}
        {...rest}
      />
    </Root>
  )
}

export default MainFeature
