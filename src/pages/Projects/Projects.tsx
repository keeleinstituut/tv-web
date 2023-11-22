import Button from 'components/molecules/Button/Button'
import { FC } from 'react'
import { includes } from 'lodash'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import ProjectsTable from 'components/organisms/tables/ProjectsTable/ProjectsTable'

// TODO: WIP - implement this page

const Projects: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('projects.project_tile')}</h1>
        {/* TODO: add tooltip */}
        <Button
          children={t('button.add_project')}
          href="/projects/new-project"
          hidden={!includes(userPrivileges, Privileges.CreateProject)}
        />
      </div>
      <ProjectsTable />
    </>
  )
}

export default Projects
