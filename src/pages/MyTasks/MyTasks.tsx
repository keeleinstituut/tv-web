import { FC, useState } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import { chain } from 'lodash'
import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useFetchHistoryTasks, useFetchTasks } from 'hooks/requests/useTasks'
import { ListTask, TasksTabType } from 'types/tasks'
import {
  FilterFunctionType,
  PaginationFunctionType,
  ResponseMetaTypes,
  SortingFunctionType,
} from 'types/collective'

import classes from './classes.module.scss'

export interface TasksTableProps {
  tasks: ListTask[]
  paginationData?: ResponseMetaTypes
  handleFilterChange: (value?: FilterFunctionType) => void
  handleSortingChange: (value?: SortingFunctionType) => void
  handlePaginationChange: (value?: PaginationFunctionType) => void
  isLoading: boolean
  tasksTabType: TasksTabType
}

const MyTasks: FC = () => {
  const { t } = useTranslation()

  const {
    tasks = [],
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks({ assigned_to_me: 1 })

  const {
    tasks: waitingTasks = [],
    isLoading: isLoadingWaitingTasks,
    paginationData: waitingTasksPaginationData,
    handleFilterChange: handleWaitingTasksFilterChange,
    handleSortingChange: handleWaitingTasksSortingChange,
    handlePaginationChange: handleWaitingTasksPaginationChange,
  } = useFetchTasks({ assigned_to_me: 0 })

  const {
    historyTasks = [],
    isLoading: isLoadingHistoryTasks,
    paginationData: historyPaginationData,
    handleFilterChange: handleHistoryFilterChange,
    handleSortingChange: handleHistorySortingChange,
    handlePaginationChange: handleHisoryPaginationChange,
  } = useFetchHistoryTasks()

  const [activeTab, setActiveTab] = useState<string | undefined>(
    t('my_tasks.my_assignments')
  )

  let Component: FC<TasksTableProps> = () => null

  let componentProps: TasksTableProps = {
    tasks: tasks,
    isLoading: isLoading,
    paginationData: paginationData,
    handleFilterChange: handleFilterChange,
    handleSortingChange: handleSortingChange,
    handlePaginationChange: handlePaginationChange,
    tasksTabType: TasksTabType.MyTasks,
  }

  switch (activeTab) {
    case t('my_tasks.my_assignments'):
      Component = TasksTable
      componentProps = {
        tasks: tasks,
        isLoading: isLoading,
        paginationData: paginationData,
        handleFilterChange: handleFilterChange,
        handleSortingChange: handleSortingChange,
        handlePaginationChange: handlePaginationChange,
        tasksTabType: TasksTabType.MyTasks,
      }
      break
    case t('my_tasks.pending_assignments'):
      Component = TasksTable
      componentProps = {
        tasks: waitingTasks,
        isLoading: isLoadingWaitingTasks,
        paginationData: waitingTasksPaginationData,
        handleFilterChange: handleWaitingTasksFilterChange,
        handleSortingChange: handleWaitingTasksSortingChange,
        handlePaginationChange: handleWaitingTasksPaginationChange,
        tasksTabType: TasksTabType.PendingTasks,
      }
      break
    case t('my_tasks.my_tasks_history'):
      Component = TasksTable
      componentProps = {
        tasks: historyTasks,
        isLoading: isLoadingHistoryTasks,
        paginationData: historyPaginationData,
        handleFilterChange: handleHistoryFilterChange,
        handleSortingChange: handleHistorySortingChange,
        handlePaginationChange: handleHisoryPaginationChange,
        tasksTabType: TasksTabType.History,
      }
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

      <Component {...componentProps} />
    </>
  )
}

export default MyTasks
