import { FC, useCallback, useMemo, useState } from 'react'
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

export enum TasksTabType {
  MyTasks = 'my_assignments',
  PendingAssignments = 'pending_assignments',
  MyTasksHistory = 'my_tasks_history',
}

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
  const [activeTab, setActiveTab] = useState<TasksTabType>(TasksTabType.MyTasks)

  const {
    tasks,
    filters,
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks({
    assigned_to_me: 1,
    disabled: activeTab !== TasksTabType.MyTasks,
  })

  const {
    tasks: waitingTasks,
    filters: waitingTasksFilters,
    isLoading: isLoadingWaitingTasks,
    paginationData: waitingTasksPaginationData,
    handleFilterChange: handleWaitingTasksFilterChange,
    handleSortingChange: handleWaitingTasksSortingChange,
    handlePaginationChange: handleWaitingTasksPaginationChange,
  } = useFetchTasks({
    assigned_to_me: 0,
    disabled: activeTab !== TasksTabType.PendingAssignments,
  })

  const {
    historyTasks = [],
    filters: historyTasksFilters,
    isLoading: isLoadingHistoryTasks,
    paginationData: historyPaginationData,
    handleFilterChange: handleHistoryFilterChange,
    handleSortingChange: handleHistorySortingChange,
    handlePaginationChange: handleHistoryPaginationChange,
  } = useFetchHistoryTasks({
    disabled: activeTab !== TasksTabType.MyTasksHistory,
  })

  const componentProps = useMemo(() => {
    switch (activeTab) {
      case TasksTabType.MyTasks:
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
      case TasksTabType.PendingAssignments:
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
      case TasksTabType.MyTasksHistory:
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

  const taskTabs = map(TasksTabType, (type) => ({
    id: type,
    name: t(`my_tasks.${type}`),
  }))

  const handleActiveTabChange = useCallback((newTab?: string) => {
    setActiveTab(newTab as TasksTabType)
  }, [])

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('my_tasks.my_assignments')}</h1>
        <Tooltip helpSectionKey="myTasks" />
      </div>

      <Tabs
        setActiveTab={handleActiveTabChange}
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
