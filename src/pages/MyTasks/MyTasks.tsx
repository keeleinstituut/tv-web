import { FC, useMemo, useState } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import { map } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useFetchHistoryTasks, useFetchTasks } from 'hooks/requests/useTasks'

import classes from './classes.module.scss'

const MyTasks: FC = () => {
  const { t } = useTranslation()

  const {
    tasks,
    filters,
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks({ assigned_to_me: 1 })

  const {
    tasks: waitingTasks,
    filters: waitingTasksFilters,
    isLoading: isLoadingWaitingTasks,
    paginationData: waitingTasksPaginationData,
    handleFilterChange: handleWaitingTasksFilterChange,
    handleSortingChange: handleWaitingTasksSortingChange,
    handlePaginationChange: handleWaitingTasksPaginationChange,
  } = useFetchTasks({ assigned_to_me: 0 })

  const {
    historyTasks = [],
    filters: historyTasksFilters,
    isLoading: isLoadingHistoryTasks,
    paginationData: historyPaginationData,
    handleFilterChange: handleHistoryFilterChange,
    handleSortingChange: handleHistorySortingChange,
    handlePaginationChange: handleHistoryPaginationChange,
  } = useFetchHistoryTasks()

  const [activeTab, setActiveTab] = useState<string | undefined>(
    t('my_tasks.my_assignments')
  )

  const componentProps = useMemo(() => {
    switch (activeTab) {
      case t('my_tasks.my_assignments'):
        return {
          tasks: tasks || [],
          filters: filters,
          isLoading: isLoading,
          paginationData: paginationData,
          handleFilterChange: handleFilterChange,
          handleSortingChange: handleSortingChange,
          handlePaginationChange: handlePaginationChange,
          isHistoryTab: false,
        }
      case t('my_tasks.pending_assignments'):
        return {
          tasks: waitingTasks || [],
          filters: waitingTasksFilters,
          isLoading: isLoadingWaitingTasks,
          paginationData: waitingTasksPaginationData,
          handleFilterChange: handleWaitingTasksFilterChange,
          handleSortingChange: handleWaitingTasksSortingChange,
          handlePaginationChange: handleWaitingTasksPaginationChange,
          isHistoryTab: false,
        }
      case t('my_tasks.my_tasks_history'):
        return {
          tasks: historyTasks || [],
          filters: historyTasksFilters,
          isLoading: isLoadingHistoryTasks,
          paginationData: historyPaginationData,
          handleFilterChange: handleHistoryFilterChange,
          handleSortingChange: handleHistorySortingChange,
          handlePaginationChange: handleHistoryPaginationChange,
          isHistoryTab: true,
        }
      default:
        return {}
    }
  }, [
    activeTab,
    t,
    tasks,
    filters,
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    waitingTasks,
    waitingTasksFilters,
    isLoadingWaitingTasks,
    waitingTasksPaginationData,
    handleWaitingTasksFilterChange,
    handleWaitingTasksSortingChange,
    handleWaitingTasksPaginationChange,
    historyTasks,
    historyTasksFilters,
    isLoadingHistoryTasks,
    historyPaginationData,
    handleHistoryFilterChange,
    handleHistorySortingChange,
    handleHistoryPaginationChange,
  ])

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
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        tabStyle={TabStyle.Primary}
        tabs={taskTabs}
        addDisabled
        className={classes.tabsContainer}
        editDisabled
      />

      <TasksTable {...componentProps} />
    </>
  )
}

export default MyTasks
