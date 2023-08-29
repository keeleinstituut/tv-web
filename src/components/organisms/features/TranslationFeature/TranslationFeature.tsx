import { FC, useCallback, useState } from 'react'
import { SubOrderDetail } from 'types/orders'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'

// TODO: check later looks pretty much the same as OverviewFeature and RevisionFeature
// TODO: this is WIP code for suborder view

type TranslationFeatureProps = Pick<
  SubOrderDetail,
  | 'assignments'
  | 'cat_jobs'
  | 'source_language_classifier_value_id'
  | 'destination_language_classifier_value_id'
> & {
  catSupported?: boolean
}

const TranslationFeature: FC<TranslationFeatureProps> = ({
  catSupported,
  cat_jobs,
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
          addVendor,
          catSupported,
        }}
      />
      <FeatureAssignments hidden={activeTab === FeatureTabs.Xliff} {...rest} />
    </Root>
  )
}

export default TranslationFeature
