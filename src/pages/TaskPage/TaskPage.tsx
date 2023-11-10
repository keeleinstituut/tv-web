import Loader from 'components/atoms/Loader/Loader'
import { FC } from 'react'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import Task from 'components/organisms/Task/Task'
import Button from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useFetchTask } from 'hooks/requests/useTasks'

import classes from './classes.module.scss'

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { taskId } = useParams()

  const { task, isLoading } = useFetchTask({ id: taskId })

  console.log('task ', task)

  // const {
  //   id,
  //   assignment: { subProject, ext_id },
  // } = task || {}

  const id = task?.id
  const assignment = task?.assignment
  const ext_id = task?.assignment?.ext_id

  const subProject = assignment?.subProject

  const project = subProject?.project
  const cat_files = subProject?.cat_files
  const source_language_classifier_value =
    subProject?.source_language_classifier_value

  const destination_language_classifier_value =
    subProject?.destination_language_classifier_value

  // const {
  //   project,
  //   cat_files,
  //   source_language_classifier_value,
  //   destination_language_classifier_value,
  // } = subProject

  // TODO: check is "Tellija" of the order current user
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.taskTitleContainer}>
        <h1 className={classes.titleRow}>{ext_id}</h1>
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
