import SubProjectsTable from 'components/organisms/tables/SubProjectsTable/SubProjectsTable'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'

// TODO: WIP - implement this page

const SubProjects: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('projects.sub_project_tile')}</h1>
        {/* TODO: add tooltip */}
      </div>
      <SubProjectsTable />
    </>
  )
}

export default SubProjects
