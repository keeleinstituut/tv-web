import { FC, useMemo, useState } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import { map } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useFetchHistoryTasks, useFetchTasks } from 'hooks/requests/useTasks'
import { ListTask, TasksPayloadType } from 'types/tasks'
import {
  FilterFunctionType,
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from 'types/collective'

import classes from './classes.module.scss'

export interface TasksTableProps {
  tasks?: ListTask[]
  filters?: object | TasksPayloadType
  isLoading?: boolean
  paginationData?: ResponseMetaTypes | undefined
  handleFilterChange?: (value?: FilterFunctionType | undefined) => void
  handleSortingChange?: (value?: SortingFunctionType | undefined) => void
  handlePaginationChange?: (value?: PaginationFunctionType | undefined) => void
  isHistoryTab?: boolean
}

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
    handlePaginationChange: handleHisoryPaginationChange,
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
          handlePaginationChange: handleHisoryPaginationChange,
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
    handleHisoryPaginationChange,
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
