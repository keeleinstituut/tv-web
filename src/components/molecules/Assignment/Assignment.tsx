import { FC, useCallback } from 'react'
import { map, includes } from 'lodash'
import { SubProjectFeatures } from 'types/projects'
import { AssignmentStatus, AssignmentType } from 'types/assignments'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'

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

import { useCompleteAssignment } from 'hooks/requests/useAssignments'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import AssignmentForm from 'components/organisms/forms/AssignmentForm/AssignmentForm'

dayjs.extend(utc)

interface AssignmentProps extends AssignmentType {
  index: number
  catSupported?: boolean
  isEditable?: boolean
}

const Assignment: FC<AssignmentProps> = ({
  index,
  candidates,
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
}) => {
  const {
    source_language_classifier_value_id,
    destination_language_classifier_value_id,
    workflow_started,
  } = useSubProjectCache(sub_project_id) || {}
  const { t } = useTranslation()
  const { completeAssignment, isLoading: isCompletingAssignment } =
    useCompleteAssignment({
      id,
    })

  const { deleteAssignment, isLoading: isDeletingAssignment } =
    useDeleteAssignment({
      sub_project_id,
    })

  const feature = job_definition.job_key
  const skill_id = job_definition.skill_id

  const handleMarkAssignmentAsFinished = useCallback(async () => {
    try {
      await completeAssignment({})
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_finished'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [completeAssignment, t])

  const selectedVendorsIds = map(candidates, 'vendor.id')

  const openConfirmAssignmentCompletion = useCallback(() => {
    showModal(ModalTypes.ConfirmAssignmentCompletion, {
      sub_project_id,
      id,
    })
  }, [id, sub_project_id])

  const sendToPreviousAssignment = useCallback(async () => {
    try {
      await completeAssignment({ accepted: false })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.sent_to_previous_task'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [completeAssignment, t])

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
    })
  }, [
    id,
    skill_id,
    selectedVendorsIds,
    source_language_classifier_value_id,
    destination_language_classifier_value_id,
  ])

  return (
    <div className={classes.assignmentContainer}>
      <div>
        <h3 className={classes.titleContainer}>
          {t('task.vendor_title', { number: index + 1 })}(
          {t(`projects.features.${feature}`)})
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
            feature === SubProjectFeatures.JobOverview ||
            !includes(
              [AssignmentStatus.New, AssignmentStatus.InProgress],
              status
            )
          }
        >
          {t('button.choose_from_database')}
        </Button>
        <AssignmentForm
          id={id}
          sub_project_id={sub_project_id}
          isEditable={isEditable}
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
            assignee_id: assignee?.id,
            finished_at,
            isEditable,
          }}
        />
      </div>
      <div className={classes.formButtons}>
        <Button
          appearance={AppearanceTypes.Secondary}
          children={t('button.send_to_previous_task')}
          onClick={sendToPreviousAssignment}
          hidden={feature !== SubProjectFeatures.JobOverview}
          disabled={!isEditable || status !== AssignmentStatus.InProgress}
        />
        <Button
          children={t('button.mark_as_finished')}
          disabled={status !== AssignmentStatus.InProgress}
          loading={isCompletingAssignment}
          onClick={
            feature !== SubProjectFeatures.JobOverview
              ? handleMarkAssignmentAsFinished
              : openConfirmAssignmentCompletion
          }
        />
      </div>
    </div>
  )
}

export default Assignment
