import { FC, useCallback, useState } from 'react'
import {
  ProjectStatus,
  SubProjectDetail,
  SubProjectFeatures,
} from 'types/projects'
import { Root } from '@radix-ui/react-form'
import { useTranslation } from 'react-i18next'
import FeatureHeaderSection, {
  FeatureTabs,
} from 'components/organisms/FeatureHeaderSection/FeatureHeaderSection'
import FeatureAssignments from 'components/molecules/FeatureAssignments/FeatureAssignments'
import FeatureCatJobs from 'components/molecules/FeatureCatJobs/FeatureCatJobs'
import { useSplitAssignment } from 'hooks/requests/useAssignments'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { get } from 'lodash'

type MainFeatureProps = Pick<
  SubProjectDetail,
  | 'assignments'
  | 'source_language_classifier_value_id'
  | 'destination_language_classifier_value_id'
  | 'cat_analyzis'
  | 'cat_jobs'
  | 'project'
  | 'id'
  | 'mt_enabled'
  | 'deadline_at'
> & {
  catSupported?: boolean
  feature: SubProjectFeatures
}

const MainFeature: FC<MainFeatureProps> = ({
  catSupported,
  feature,
  mt_enabled,
  id,
  cat_jobs,
  assignments,
  project,
  ...rest
}) => {
  const { status: projectStatus } = project
  const { t } = useTranslation()
  const isSomethingEditable = projectStatus !== ProjectStatus.Accepted
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

  const addVendor = useCallback(async () => {
    const payload = {
      sub_project_id: assignments[0].sub_project_id,
      job_key: feature,
    }

    try {
      await splitAssignment(payload)

      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.split_assignment'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [assignments, feature, splitAssignment, t])

  const isFirstTaskJobRevision =
    get(assignments[0], 'feature') === 'job_revision'

  const isMultiAssignmentsEnabled =
    assignments[0].job_definition.multi_assignments_enabled

  const cannotAddVendor = (
    feature: SubProjectFeatures,
    isFirstTaskJobRevision: boolean
  ) => {
    return (
      !isSomethingEditable ||
      feature === SubProjectFeatures.JobOverview ||
      (feature === SubProjectFeatures.JobRevision && !isFirstTaskJobRevision) ||
      !isMultiAssignmentsEnabled
    )
  }

  return (
    <Root>
      <FeatureHeaderSection
        {...{
          setActiveTab,
          activeTab,
          tabs: featureTabs,
          addVendor: cannotAddVendor(feature, isFirstTaskJobRevision)
            ? undefined
            : addVendor,
          catSupported,
          isLoading,
          mt_enabled,
          isEditable: isSomethingEditable,
          id,
        }}
      />
      <FeatureAssignments
        assignments={assignments}
        hidden={activeTab === FeatureTabs.Xliff}
        catSupported={catSupported}
        project={project}
        isEditable={isSomethingEditable}
        {...rest}
      />
      <FeatureCatJobs
        hidden={activeTab === FeatureTabs.Vendors}
        assignments={assignments}
        subProjectCatJobs={cat_jobs}
        {...rest}
      />
    </Root>
  )
}

export default MainFeature
