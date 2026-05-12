import { FC, useCallback } from 'react'
import { map } from 'lodash'
import { SubProjectFeatures } from 'types/projects'
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
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from '../Notification/Notification'
import { useDeleteAssignment } from 'hooks/requests/useAssignments'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import AssignmentForm from 'components/organisms/forms/AssignmentForm/AssignmentForm'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import { includes, size } from 'lodash'

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
  } = useSubProjectCache(sub_project_id) || {}
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const canManageRequests = includes(userPrivileges, Privileges.ManageRequests)
  const hasInHouseVendorsAssigned = size(candidates) > 0

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
    })
  }, [id])

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

        <Button
          size={SizeTypes.S}
          className={classes.addButton}
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
          className={classes.addButton}
          hidden={!canManageRequests}
          onClick={handleOpenComposeRequestModal}
          disabled={
            job_key === SubProjectFeatures.JobOverview ||
            isAssignmentFinished ||
            hasInHouseVendorsAssigned
          }
        >
          {t('requests.compose_button')}
        </Button>
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
