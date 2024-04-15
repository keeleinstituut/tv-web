import Loader from 'components/atoms/Loader/Loader'
import { FC, useCallback } from 'react'
import ProjectDetails, {
  ProjectDetailModes,
} from 'components/organisms/ProjectDetails/ProjectDetails'
import TaskDetails from 'components/organisms/TaskDetails/TaskDetails'
import Button from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useAcceptTask,
  useFetchHistoryTask,
  useFetchTask,
} from 'hooks/requests/useTasks'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { includes } from 'lodash'
import { useFetchProject } from 'hooks/requests/useProjects'

import classes from './classes.module.scss'
import { TaskType } from 'types/tasks'
import { useAuth } from 'components/contexts/AuthContext'

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId, isHistoryView } = useParams()
  const navigate = useNavigate()
  const { institutionUserId } = useAuth()

  const { task, isLoading } = useFetchTask({
    id: taskId,
  })
  const { historyTask, isLoading: isLoadingHistoryTask } = useFetchHistoryTask({
    id: taskId,
  })

  const { acceptTask, isLoading: isAcceptingTask } = useAcceptTask({
    id: taskId,
  })

  const isLoadingToCheck = isHistoryView ? isLoadingHistoryTask : isLoading

  const { assignment, assignee_institution_user_id, task_type } = isHistoryView
    ? historyTask || {}
    : task || {}

  const isTaskAssignedToMe =
    assignee_institution_user_id &&
    assignee_institution_user_id === institutionUserId

  // Correcting and Review are PM tasks
  // PM should have all the necessary privileges to fetch everything
  // ClientReview is for client, who should never reach this page
  // All other task_types are for vendors, who will get the necessary data from the task details
  const isVendor = !includes(
    [TaskType.ClientReview, TaskType.Review, TaskType.Correcting],
    task_type
  )

  const { subProject, ext_id, price } = assignment || {}

  const { project, project_id } = subProject || {}

  const { project: taskProject } = useFetchProject({
    id: project_id,
    disabled: isVendor,
  })

  const projectToUse = isVendor ? project : taskProject

  const activeJobDefinition = subProject?.active_job_definition
  const subProjectStatus = subProject?.status
  const { job_short_name } = activeJobDefinition || {}

  const handleAcceptTask = useCallback(async () => {
    try {
      await acceptTask()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_successfully_accepted'),
      })
      navigate('/projects/my-tasks')
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [acceptTask, navigate, t])

  if (isLoadingToCheck) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.taskTitleContainer}>
        <h1 className={classes.titleRow}>{ext_id}</h1>
        <Button
          className={classes.acceptButton}
          onClick={handleAcceptTask}
          loading={isAcceptingTask}
          hidden={!!assignee_institution_user_id}
        >
          {t('button.accept')}
        </Button>
      </div>

      <ProjectDetails
        mode={ProjectDetailModes.View}
        project={projectToUse}
        className={classes.orderDetails}
      />

      <div className={classes.separator} />

      <TaskDetails
        isVendor={isVendor}
        taskId={taskId}
        ext_id={ext_id}
        isLoading={isLoadingToCheck}
        isTaskAssignedToMe={!!isTaskAssignedToMe}
        isHistoryView={isHistoryView}
        task_type={task_type}
        price={price}
        job_short_name={job_short_name}
        status={subProjectStatus}
      />
    </>
  )
}

export default TaskPage
