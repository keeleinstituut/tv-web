import Loader from 'components/atoms/Loader/Loader'
import { FC } from 'react'
import { find } from 'lodash'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import Task from 'components/organisms/Task/Task'
import Button from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useFetchTasks } from 'hooks/requests/useTasks'

import classes from './classes.module.scss'

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId } = useParams()

  const { tasks, isLoading } = useFetchTasks({ assigned_to_me: 0 })

  console.log('tasks', tasks)

  const task = find(tasks, { id: taskId })

  const assignment = task?.assignment
  const id = task?.id
  const project = assignment?.subProject.project
  const catFiles = assignment?.subProject.cat_files

  // TODO: check is "Tellija" of the order current user
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.taskTitleContainer}>
        <h1 className={classes.titleRow}>{assignment?.ext_id}</h1>
        <Button
          className={classes.acceptButton}
          // TODO: handle accept task
        >
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
        ext_id={assignment?.ext_id}
        project={project}
        isLoading={isLoading}
        source_language_classifier_value={
          assignment?.subProject.source_language_classifier_value
        }
        destination_language_classifier_value={
          assignment?.subProject.destination_language_classifier_value
        }
        cat_files={catFiles}
        id={id}
      />
    </>
  )
}

export default TaskPage
