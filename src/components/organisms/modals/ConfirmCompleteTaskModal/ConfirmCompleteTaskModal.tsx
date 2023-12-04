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
import { CompleteTaskPayload } from 'types/tasks'
import { useCompleteTask } from 'hooks/requests/useTasks'
import { showValidationErrorMessage } from 'api/errorHandler'

export interface ConfirmCompleteTaskModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  taskId?: string
  completionPayload?: CompleteTaskPayload
}

const ConfirmCompleteTaskModal: FC<ConfirmCompleteTaskModalProps> = ({
  completionPayload,
  taskId,
  ...rest
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { completeTask, isLoading } = useCompleteTask({
    id: taskId,
  })

  const handleCompleteTask = useCallback(async () => {
    try {
      await completeTask(completionPayload || {})
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_marked_completed'),
      })
      navigate('/projects/my-tasks')
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [completeTask, navigate, completionPayload, t])

  return (
    <ConfirmationModalBase
      {...rest}
      title={t('modal.confirm_complete_task')}
      modalContent={t('modal.confirm_complete_task_details')}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.complete')}
      className={classes.completeModal}
      handleProceed={handleCompleteTask}
      proceedButtonLoading={isLoading}
    />
  )
}

export default ConfirmCompleteTaskModal
