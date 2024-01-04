import { FC, useMemo, useState, useCallback } from 'react'
import TasksTable, {
  TaskTableTypes,
} from 'components/organisms/tables/TasksTable/TasksTable'
import { map } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useSearchParams } from 'react-router-dom'

import classes from './classes.module.scss'

const MyTasks: FC = () => {
  const { t } = useTranslation()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<string | undefined>(
    t('my_tasks.my_assignments')
  )

  const handleSetActiveTab = useCallback(
    (newActiveTab: string | undefined) => {
      setActiveTab(newActiveTab)
      setSearchParams({
        per_page: '10',
        page: '1',
      })
    },
    [setSearchParams]
  )

  const tableType = useMemo(() => {
    switch (activeTab) {
      case t('my_tasks.my_assignments'):
        return TaskTableTypes.MyTasks
      case t('my_tasks.pending_assignments'):
        return TaskTableTypes.PendingTasks
      case t('my_tasks.my_tasks_history'):
        return TaskTableTypes.HistoryTasks
      default:
        return TaskTableTypes.MyTasks
    }
  }, [activeTab, t])

  const taskTabs = map(
    [
      t('my_tasks.my_assignments'),
      t('my_tasks.pending_assignments'),
      t('my_tasks.my_tasks_history'),
    ],
    (feature) => ({
      id: feature,
      name: feature,
    })
  )

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('my_tasks.my_assignments')}</h1>
        <Tooltip helpSectionKey="myTasks" />
      </div>

      <Tabs
        setActiveTab={handleSetActiveTab}
        activeTab={activeTab}
        tabStyle={TabStyle.Primary}
        tabs={taskTabs}
        addDisabled
        className={classes.tabsContainer}
        editDisabled
      />

      <TasksTable type={tableType} />
    </>
  )
}

export default MyTasks
