import Loader from 'components/atoms/Loader/Loader'
import { FC, useCallback, useEffect, useState } from 'react'
import { includes, toLower, without, values } from 'lodash'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import useHashState from 'hooks/useHashState'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import TaskContent from 'components/organisms/TaskContent/TaskContent'
import { ListProject, SubProjectStatus, TypesWithStartTime } from 'types/projects'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import ExpandableContentLeftComponent from 'components/molecules/ExpandableContentLeftComponent/ExpandableContentLeftComponent'
import { useIsDataOwner } from 'hooks/useIsDataOwner'

import classes from './classes.module.scss'
import { useTaskCache } from 'hooks/requests/useTasks'

interface TaskProps {
  ext_id?: string
  isLoading: boolean
  project?: ListProject
  taskId?: string
  isTaskAssignedToMe?: boolean
  isHistoryView?: string
  task_type?: string
  job_short_name?: string
  status?: SubProjectStatus
  price?: string
  isVendor?: boolean
}

const TaskDetails: FC<TaskProps> = ({
  ext_id = '',
  isLoading,
  isTaskAssignedToMe,
  job_short_name,
  status,
  price,
  taskId,
  ...rest
}) => {
  const taskData = useTaskCache(taskId)
  const { assignment, project } = taskData || {}
  const { deadline_at, event_start_at, subProject } = assignment || {}
  const {
    source_language_classifier_value,
    destination_language_classifier_value,
  } = subProject || {}

  const projectData = project || subProject?.project

  const isShared = !useIsDataOwner(projectData?.institution_id)

  const VERBAL_TYPES = values(TypesWithStartTime)

  const isVerbalType = includes(
    VERBAL_TYPES,
    projectData?.type_classifier_value?.value
  )
  const { setHash, currentHash } = useHashState()
  const [isExpanded, setIsExpanded] = useState(includes(currentHash, ext_id))

  const languageDirection = `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`

  const attemptScroll = useCallback(() => {
    const matchingElement = document.getElementById(ext_id)
    if (matchingElement && !isLoading) {
      matchingElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else if (matchingElement && isLoading) setTimeout(attemptScroll, 300)
  }, [ext_id, isLoading])

  useEffect(() => {
    if (currentHash && includes(currentHash, ext_id)) {
      attemptScroll()
      if (!isExpanded) {
        setIsExpanded(true)
      }
    }
  }, [currentHash, ext_id, attemptScroll, isExpanded])

  const handleOpenContainer = useCallback(
    (isExpanded: boolean) => {
      setHash(isExpanded ? ext_id : '')
      setIsExpanded(isExpanded)
    },
    [ext_id, setHash]
  )

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <ExpandableContentContainer
      className={classNames(
        classes.expandableContainer,
        status && classes[toLower(status)]
      )}
      onExpandedChange={handleOpenContainer}
      id={ext_id}
      isExpanded={isExpanded}
      rightComponent={
        <ProjectStatusTag status={status} jobName={job_short_name} />
      }
      wrapContent
      leftComponent={
        <ExpandableContentLeftComponent
          {...{
            ext_id,
            deadline_at: isVerbalType ? event_start_at : deadline_at,
            price,
            languageDirection,
            isVerbal: isVerbalType,
            hideCost: isShared,
          }}
          mode={ProjectDetailModes.View}
        />
      }
    >
      <TaskContent
        isLoading={isLoading}
        isTaskAssignedToMe={isTaskAssignedToMe}
        taskId={taskId}
        {...rest}
      />
    </ExpandableContentContainer>
  )
}

export default TaskDetails
