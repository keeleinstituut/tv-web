import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import ProjectDetails, {
  ProjectDetailModes,
} from 'components/organisms/ProjectDetails/ProjectDetails'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const NewProject: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('projects.new_project_title')}</h1>
        <Tooltip helpSectionKey="projectDetails" />
      </div>
      <ProjectDetails mode={ProjectDetailModes.New} />
    </>
  )
}

export default NewProject
