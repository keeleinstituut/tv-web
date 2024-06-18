import SubProjectsTable from 'components/organisms/tables/SubProjectsTable/SubProjectsTable'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

// TODO: WIP - implement this page

const SubProjects: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('projects.sub_project_tile')}</h1>
        <Tooltip className={classes.toolTip} helpSectionKey="subProject" />
      </div>
      <SubProjectsTable />
    </>
  )
}

export default SubProjects
