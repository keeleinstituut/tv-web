import { FC } from 'react'
import { toLower } from 'lodash'
import classes from './classes.module.scss'
import Tag from 'components/atoms/Tag/Tag'
import { useTranslation } from 'react-i18next'
import { ProjectStatus, SubProjectStatus } from 'types/projects'

export interface ProjectStatusTagProps {
  status?: ProjectStatus | SubProjectStatus
  jobName?: string
}

const ProjectStatusTag: FC<ProjectStatusTagProps> = ({ status, jobName }) => {
  const { t } = useTranslation()

  const jobString = jobName ? ` (${jobName})` : ''

  if (!status) return null
  return (
    <Tag
      label={`${t(`projects.status.${status}`)}${jobString}`}
      className={classes[toLower(status)]}
    />
  )
}

export default ProjectStatusTag
