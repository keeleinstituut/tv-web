import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { useNavigate } from 'react-router-dom'
import { closeModal } from '../ModalRoot'
import { useCompleteTask } from 'hooks/requests/useTasks'
import { showValidationErrorMessage } from 'api/errorHandler'

export interface ConfirmSendToPreviousTaskModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  taskId?: string
}

const ConfirmSendToPreviousTaskModal: FC<
  ConfirmSendToPreviousTaskModalProps
> = ({ taskId, ...rest }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { completeTask, isLoading } = useCompleteTask({
    id: taskId,
  })

  const sendToPreviousAssignment = useCallback(async () => {
    try {
      await completeTask({ accepted: false })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.sent_to_previous_task'),
      })
      navigate('/projects/my-tasks')
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [completeTask, navigate, t])

  return (
    <ConfirmationModalBase
      {...rest}
      title={t('modal.confirm_send_to_previous_assignment')}
      modalContent={t('modal.confirm_send_to_previous_assignment_details')}
      cancelButtonContent={t('button.quit_alt')}
      proceedButtonContent={t('button.send_back')}
      className={classes.completeModal}
      handleProceed={sendToPreviousAssignment}
      proceedButtonLoading={isLoading}
    />
  )
}

export default ConfirmSendToPreviousTaskModal
