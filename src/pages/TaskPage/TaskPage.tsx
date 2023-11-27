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
import { isEmpty } from 'lodash'
import { useFetchProject } from 'hooks/requests/useProjects'

import classes from './classes.module.scss'

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId, isHistoryView } = useParams()
  const navigate = useNavigate()

  const { task, isLoading } = useFetchTask({
    id: taskId,
  })
  const { historyTask, isLoading: isLoadingHistoryTask } = useFetchHistoryTask({
    id: taskId,
  })

  const { acceptTask, isLoading: isAcceptingTask } = useAcceptTask({
    id: taskId,
  })

  const { assignment, assignee_institution_user_id, task_type } = isHistoryView
    ? historyTask || {}
    : task || {}

  const { subProject, ext_id, sub_project_id, volumes, comments } =
    assignment || {}

  const {
    project,
    cat_files,
    source_files,
    source_language_classifier_value,
    destination_language_classifier_value,
    project_id,
  } = subProject || {}

  const { project: taskProject } = useFetchProject({ id: project_id })

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

  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.taskTitleContainer}>
        <h1 className={classes.titleRow}>{ext_id}</h1>
        <Button
          className={classes.acceptButton}
          onClick={handleAcceptTask}
          loading={isAcceptingTask}
          hidden={!isEmpty(assignee_institution_user_id)}
        >
          {t('button.accept')}
        </Button>
      </div>

      <ProjectDetails
        mode={ProjectDetailModes.View}
        project={taskProject}
        className={classes.orderDetails}
      />

      <div className={classes.separator} />

      <TaskDetails
        ext_id={ext_id}
        project={project}
        isLoading={isHistoryView ? isLoadingHistoryTask : isLoading}
        source_language_classifier_value={source_language_classifier_value}
        destination_language_classifier_value={
          destination_language_classifier_value
        }
        cat_files={cat_files}
        source_files={source_files || []}
        sub_project_id={sub_project_id || ''}
        volumes={volumes}
        taskId={taskId}
        comments={comments}
        assignee_institution_user_id={assignee_institution_user_id}
        isHistoryView={isHistoryView}
        task_type={task_type}
      />
    </>
  )
}

export default TaskPage
