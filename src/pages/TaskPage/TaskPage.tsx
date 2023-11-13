import Loader from 'components/atoms/Loader/Loader'
import { FC, useCallback } from 'react'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import Task from 'components/organisms/Task/Task'
import Button from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useFetchTask } from 'hooks/requests/useTasks'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'

import classes from './classes.module.scss'

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId } = useParams()

  const { task, isLoading } = useFetchTask({ id: taskId })

  const { id, assignment } = task || {}
  const { subProject, ext_id } = assignment || {}

  const {
    project,
    cat_files,
    source_language_classifier_value,
    destination_language_classifier_value,
  } = subProject || {}

  const handleAcceptTask = useCallback(async () => {
    try {
      // TODO: add accepting task endpoint
      // await acceptTask({
      // })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_successfully_accepted'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [t])

  // TODO: check is "Tellija" of the order current user
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.taskTitleContainer}>
        <h1 className={classes.titleRow}>{ext_id}</h1>
        <Button className={classes.acceptButton} onClick={handleAcceptTask}>
          {t('button.accept')}
        </Button>
      </div>

      <OrderDetails
        mode={OrderDetailModes.Editable}
        order={project}
        className={classes.orderDetails}
        isTaskView
      />

      <div className={classes.separator} />

      <Task
        ext_id={ext_id}
        project={project}
        isLoading={isLoading}
        source_language_classifier_value={source_language_classifier_value}
        destination_language_classifier_value={
          destination_language_classifier_value
        }
        cat_files={cat_files}
        id={id}
      />
    </>
  )
}

export default TaskPage
