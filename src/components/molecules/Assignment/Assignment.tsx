import { FC, useCallback } from 'react'
import { includes, map, size, some } from 'lodash'
import { SubProjectFeatures, SubProjectStatus } from 'types/projects'
import { AssignmentStatus, AssignmentType } from 'types/assignments'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import Delete from 'assets/icons/delete.svg?react'

import classes from './classes.module.scss'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import AssignmentCandidatesSection from 'components/molecules/AssignmentCandidatesSection/AssignmentCandidatesSection'
import OutsourceRequestsSection from 'components/molecules/OutsourceRequestsSection/OutsourceRequestsSection'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from '../Notification/Notification'
import { useDeleteAssignment } from 'hooks/requests/useAssignments'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import { useFetchAssignmentOutsourceRequests } from 'hooks/requests/useProjectRequests'
import { OutsourceRequestStatus } from 'types/outsourceRequests'
import AssignmentForm from 'components/organisms/forms/AssignmentForm/AssignmentForm'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

dayjs.extend(utc)

interface AssignmentProps extends AssignmentType {
  index: number
  catSupported?: boolean
  isEditable?: boolean
}

const Assignment: FC<AssignmentProps> = ({
  index,
  candidates,
  manager_candidates,
  id,
  sub_project_id,
  assigned_vendor_id,
  assignee,
  job_definition,
  finished_at,
  catSupported,
  ext_id,
  status,
  isEditable,
  event_start_at,
}) => {
  const isAssignmentFinished = status === AssignmentStatus.Done
  const {
    source_language_classifier_value_id,
    destination_language_classifier_value_id,
    workflow_started,
    status: subProjectStatus,
  } = useSubProjectCache(sub_project_id) || {}
  const { t } = useTranslation()
  const { userPrivileges, selectedInstitutionType } = useAuth()
  const canManageRequests = includes(userPrivileges, Privileges.ManageRequests)
  const hasInHouseVendorsAssigned = size(candidates) > 0
  const { requests: outsourceRequests } =
    useFetchAssignmentOutsourceRequests(id)
  const hasNonCancelledOutsourceRequest = some(
    outsourceRequests,
    (r) => r.status !== OutsourceRequestStatus.Cancelled
  )

  const { deleteAssignment, isLoading: isDeletingAssignment } =
    useDeleteAssignment({
      sub_project_id,
    })

  const { job_key, skill_id, job_short_name } = job_definition

  const selectedVendorsIds = map(candidates, 'vendor.id')

  const openConfirmAssignmentCompletion = useCallback(() => {
    showModal(ModalTypes.ConfirmAssignmentCompletion, {
      sub_project_id,
      id,
    })
  }, [id, sub_project_id])

  const openConfirmAssignmentFinished = useCallback(() => {
    showModal(ModalTypes.ConfirmAssignmentFinished, {
      id,
    })
  }, [id])

  const openConfirmSendToPreviousAssignment = useCallback(() => {
    showModal(ModalTypes.ConfirmSendToPreviousAssignment, {
      id,
    })
  }, [id])

  const handleDeleteAssignment = useCallback(async () => {
    try {
      await deleteAssignment(id)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.assignment_deleted'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [deleteAssignment, id, t])

  const handleOpenVendorsModal = useCallback(() => {
    showModal(ModalTypes.SelectVendor, {
      assignmentId: id,
      selectedVendorsIds,
      skill_id,
      source_language_classifier_value_id,
      destination_language_classifier_value_id,
      event_start_at,
    })
  }, [
    id,
    skill_id,
    selectedVendorsIds,
    source_language_classifier_value_id,
    destination_language_classifier_value_id,
    event_start_at,
  ])

  const handleOpenComposeRequestModal = useCallback(() => {
    showModal(ModalTypes.ComposeProjectRequest, {
      assignmentId: id,
      sub_project_id,
    })
  }, [id, sub_project_id])

  return (
    <div className={classes.assignmentContainer}>
      <div>
        <h3 className={classes.titleContainer}>
          {t('task.vendor_title', { number: index + 1 })}({job_short_name})
          <BaseButton
            className={classes.deleteButton}
            hidden={index === 0 || workflow_started}
            onClick={handleDeleteAssignment}
            loading={isDeletingAssignment}
            aria-label={t('button.delete')}
          >
            <Delete />
          </BaseButton>
        </h3>

        <span className={classes.assignmentId}>{ext_id}</span>

        <div className={classes.addButtonRow}>
          <Button
            size={SizeTypes.S}
            onClick={handleOpenVendorsModal}
            disabled={
              job_key === SubProjectFeatures.JobOverview || isAssignmentFinished
            }
          >
            {t('button.choose_from_database')}
          </Button>
          <Button
            size={SizeTypes.S}
            appearance={AppearanceTypes.Secondary}
            hidden={
              !canManageRequests ||
              selectedInstitutionType === 'TRANSLATION_AGENCY' ||
              subProjectStatus === SubProjectStatus.Cancelled ||
              subProjectStatus === SubProjectStatus.Completed
            }
            onClick={handleOpenComposeRequestModal}
            disabled={
              job_key === SubProjectFeatures.JobOverview ||
              isAssignmentFinished ||
              hasInHouseVendorsAssigned ||
              hasNonCancelledOutsourceRequest
            }
          >
            {t('requests.compose_button')}
          </Button>
        </div>
        <AssignmentForm
          id={id}
          sub_project_id={sub_project_id}
          isEditable={isEditable}
          isAssignmentFinished={isAssignmentFinished}
          catSupported={catSupported}
        />
      </div>
      <div>
        <AssignmentCandidatesSection
          {...{
            id,
            job_definition,
            assigned_vendor_id,
            candidates,
            manager_candidates,
            assignee_id: assignee?.id,
            finished_at,
            isEditable,
            assignmentStatus: status,
          }}
        />
      </div>
      <OutsourceRequestsSection
        requests={outsourceRequests}
        isAssignmentFinished={isAssignmentFinished}
        className={classes.fullWidth}
      />
      <div className={classes.formButtons}>
        <Button
          appearance={AppearanceTypes.Secondary}
          children={t('button.send_to_previous_task')}
          onClick={openConfirmSendToPreviousAssignment}
          hidden={job_key !== SubProjectFeatures.JobOverview}
          disabled={!isEditable || status !== AssignmentStatus.InProgress}
        />
        <Button
          children={t('button.mark_as_finished')}
          disabled={status !== AssignmentStatus.InProgress}
          onClick={
            job_key !== SubProjectFeatures.JobOverview
              ? openConfirmAssignmentFinished
              : openConfirmAssignmentCompletion
          }
        />
      </div>
    </div>
  )
}

export default Assignment
