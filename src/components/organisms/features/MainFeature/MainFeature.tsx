import { FC, useCallback, useState } from 'react'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'
import FeatureCatJobs from 'components/molecules/FeatureCatJobs/FeatureCatJobs'
import { useSplitAssignment } from 'hooks/requests/useOrders'

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
}

const MainFeature: FC<MainFeatureProps> = ({
  catSupported,
  feature,
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
  const { splitAssignment, isLoading } = useSplitAssignment()

  // const addVendor = useCallback(() => {
  //   // DO sth
  // }, [])

  const addVendor = useCallback(async () => {
    const payload = {
      sub_project_id: '9a1fd624-0808-4c9b-9226-bb9db07d07ce',
      feature: 'job_overview',
    }

    try {
      await splitAssignment(payload)

      // showNotification({
      //   type: NotificationTypes.Success,
      //   title: t('notification.announcement'),
      //   content: t('success.machine_translation'),
      // })
    } catch (errorData) {
      // showValidationErrorMessage(errorData)
    }
  }, [splitAssignment])

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
