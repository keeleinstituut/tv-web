import { FC, useState } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import { chain } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

import classes from './classes.module.scss'

const MyTasks: FC = () => {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<string | undefined>(
    t('my_tasks.my_assignments')
  )

  let Component: FC = () => null
  switch (activeTab) {
    case t('my_tasks.my_assignments'):
    case t('my_tasks.pending_assignments'):
    case t('my_tasks.my_tasks_history'):
      Component = TasksTable
      break
    default:
      break
  }

  const taskTabs = chain([
    t('my_tasks.my_assignments'),
    t('my_tasks.pending_assignments'),
    t('my_tasks.my_tasks_history'),
  ])
    .map((feature) => ({
      id: feature,
      name: feature,
    }))
    .value()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('my_tasks.my_assignments')}</h1>
        <Tooltip helpSectionKey="myTasks" />
      </div>

      <Tabs
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabStyle={TabStyle.Primary}
        tabs={taskTabs}
        addDisabled
        className={classes.tabsContainer}
        editDisabled
      />

      <Component />
    </>
  )
}

export default MyTasks
