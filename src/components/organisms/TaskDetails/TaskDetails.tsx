import Loader from 'components/atoms/Loader/Loader'
import { FC, useCallback, useEffect, useState } from 'react'
import { includes, toLower } from 'lodash'
import ExpandableContentContainer from 'components/molecules/ExpandableContentContainer/ExpandableContentContainer'
import classNames from 'classnames'
import useHashState from 'hooks/useHashState'
import ProjectStatusTag from 'components/molecules/ProjectStatusTag/ProjectStatusTag'
import TaskContent from 'components/organisms/TaskContent/TaskContent'
import { ListProject, SourceFile, SubProjectStatus } from 'types/projects'
import { LanguageClassifierValue } from 'types/classifierValues'
import { VolumeValue } from 'types/volumes'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import ExpandableContentLeftComponent from 'components/molecules/ExpandableContentLeftComponent/ExpandableContentLeftComponent'

import classes from './classes.module.scss'

interface TaskProps {
  ext_id?: string
  isLoading: boolean
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  project?: ListProject
  cat_files?: SourceFile[]
  source_files: SourceFile[]
  sub_project_id: string
  volumes?: VolumeValue[]
  taskId?: string
  comments?: string
  assignee_institution_user_id?: string
  isHistoryView?: string
  task_type?: string
  deadline_at?: string
  event_start_at?: string
  job_short_name?: string
  status?: SubProjectStatus
  final_files?: SourceFile[]
  price?: string
}

const TaskDetails: FC<TaskProps> = ({
  ext_id = '',
  isLoading,
  source_language_classifier_value,
  destination_language_classifier_value,
  assignee_institution_user_id,
  job_short_name,
  status,
  deadline_at,
  price,
  ...rest
}) => {
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
          {...{ ext_id, deadline_at, price, languageDirection }}
          mode={ProjectDetailModes.View}
        />
      }
    >
      <TaskContent
        destination_language_classifier_value={
          destination_language_classifier_value
        }
        isLoading={isLoading}
        assignee_institution_user_id={assignee_institution_user_id}
        {...rest}
      />
    </ExpandableContentContainer>
  )
}

export default TaskDetails
