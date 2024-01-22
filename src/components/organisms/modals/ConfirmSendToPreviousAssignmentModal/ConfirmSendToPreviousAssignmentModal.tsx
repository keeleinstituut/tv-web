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

export interface ConfirmSendToPreviousAssignmentModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  id?: string
}

const ConfirmSendToPreviousAssignmentModal: FC<
  ConfirmSendToPreviousAssignmentModalProps
> = ({ id, closeModal, ...rest }) => {
  const { t } = useTranslation()
  const { completeAssignment, isLoading: isCompletingAssignment } =
    useCompleteAssignment({
      id,
    })

  const sendToPreviousAssignment = useCallback(async () => {
    try {
      await completeAssignment({ accepted: false })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.sent_to_previous_task'),
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
      title={t('modal.confirm_send_to_previous_assignment')}
      modalContent={t('modal.confirm_send_to_previous_assignment_details')}
      cancelButtonContent={t('button.quit_alt')}
      proceedButtonContent={t('button.send_back')}
      className={classes.completeModal}
      handleProceed={sendToPreviousAssignment}
      proceedButtonLoading={isCompletingAssignment}
    />
  )
}

export default ConfirmSendToPreviousAssignmentModal
