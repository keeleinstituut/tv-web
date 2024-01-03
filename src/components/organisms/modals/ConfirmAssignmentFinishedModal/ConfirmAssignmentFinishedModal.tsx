import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCompleteAssignment } from 'hooks/requests/useAssignments'

export interface ConfirmAssignmentFinishedModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  id?: string
}

const ConfirmAssignmentFinishedModal: FC<
  ConfirmAssignmentFinishedModalProps
> = ({ id, closeModal, ...rest }) => {
  const { t } = useTranslation()
  const { completeAssignment, isLoading: isCompletingAssignment } =
    useCompleteAssignment({
      id,
    })

  const handleMarkAssignmentAsFinished = useCallback(async () => {
    try {
      await completeAssignment({})
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_finished'),
      })
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [closeModal, completeAssignment, t])

  return (
    <ConfirmationModalBase
      {...rest}
      closeModal={closeModal}
      title={t('modal.confirm_complete_task')}
      modalContent={t('modal.confirm_complete_assignment_details')}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.complete')}
      className={classes.completeModal}
      handleProceed={handleMarkAssignmentAsFinished}
      proceedButtonLoading={isCompletingAssignment}
    />
  )
}

export default ConfirmAssignmentFinishedModal
