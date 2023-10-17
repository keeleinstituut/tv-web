import { FC, useCallback, useState } from 'react'
import { SubOrderDetail, SubProjectFeatures } from 'types/orders'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'
import FeatureCatJobs from 'components/molecules/FeatureCatJobs/FeatureCatJobs'
import {
  useSplitAssignment,
  useSplitCatAssignment,
} from 'hooks/requests/useOrders'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

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
  isFirstTaskJobRevision?: boolean
}

const MainFeature: FC<MainFeatureProps> = ({
  catSupported,
  feature,
  assignments,
  isFirstTaskJobRevision,
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
  const { splitAssignment, isLoading: isSplittingAssignment } =
    useSplitAssignment()
  const { splitCatAssignment, isLoading: isSplittingCatAssignment } =
    useSplitCatAssignment()

  const addVendor = useCallback(async () => {
    const withoutCatPayload = {
      sub_project_id: assignments[0].sub_project_id,
      feature: feature,
    }

    const withCatPayload = {
      sub_project_id: assignments[0].sub_project_id,
      chunks_count: 0,
    }

    try {
      catSupported
        ? await splitCatAssignment(withCatPayload)
        : await splitAssignment(withoutCatPayload)

      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.split_assignment'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [
    assignments,
    catSupported,
    feature,
    splitAssignment,
    splitCatAssignment,
    t,
  ])

  return (
    <Root>
      <FeatureHeaderSection
        {...{
          setActiveTab,
          activeTab,
          tabs: featureTabs,
          addVendor:
            feature === SubProjectFeatures.JobOverview || isFirstTaskJobRevision
              ? undefined
              : addVendor,
          catSupported,
          loading: isSplittingAssignment || isSplittingCatAssignment,
        }}
      />
      <FeatureAssignments
        assignments={assignments}
        hidden={activeTab === FeatureTabs.Xliff}
        catSupported={catSupported}
        {...rest}
      />
      <FeatureCatJobs
        assignments={assignments}
        hidden={activeTab === FeatureTabs.Vendors}
        {...rest}
      />
    </Root>
  )
}

export default MainFeature
