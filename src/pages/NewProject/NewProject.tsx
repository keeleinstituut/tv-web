import { FC } from 'react'
import { useLocation } from 'react-router-dom'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import ProjectDetails, {
  ProjectDetailModes,
  ProjectPrefillData,
} from 'components/organisms/ProjectDetails/ProjectDetails'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const NewProject: FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const prefillData = (location.state as ProjectPrefillData | null) ?? undefined

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('projects.new_project_title')}</h1>
        <Tooltip helpSectionKey="projectDetails" />
      </div>
      <ProjectDetails mode={ProjectDetailModes.New} prefillData={prefillData} />
    </>
  )
}

export default NewProject
