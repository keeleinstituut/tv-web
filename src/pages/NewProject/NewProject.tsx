import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import ProjectDetails, {
  ProjectDetailModes,
} from 'components/organisms/ProjectDetails/ProjectDetails'

const NewProject: FC = () => {
  const { t } = useTranslation()

  return (
    <div className={classes.container}>
      <h1>{t('projects.new_project_title')}</h1>
      <ProjectDetails mode={ProjectDetailModes.New} />
      {/* <SubmitButtons /> */}
    </div>
  )
}

export default NewProject
