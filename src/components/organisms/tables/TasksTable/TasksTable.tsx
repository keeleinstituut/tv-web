import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { isEmpty, map, reduce } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { Root } from '@radix-ui/react-form'
import Tag from 'components/atoms/Tag/Tag'
import dayjs from 'dayjs'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import classNames from 'classnames'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { FilterFunctionType } from 'types/collective'
import Loader from 'components/atoms/Loader/Loader'
import { ListTask } from 'types/tasks'
import { useSearchParams } from 'react-router-dom'
import { parseLanguagePairs } from 'helpers'
import { useFetchHistoryTasks, useFetchTasks } from 'hooks/requests/useTasks'

import classes from './classes.module.scss'

export enum TaskTableTypes {
  MyTasks = 'myTasks',
  PendingTasks = 'pendingTasks',
  HistoryTasks = 'historyTasks',
  VendorTasks = 'vendorTasks',
}

export interface TasksTableProps {
  type: TaskTableTypes
  userId?: string
}

type TaskTableRow = {
  ext_id: {
    id: string
    ext_id: string
    task_type: string
  }
  reference_number?: string
  language_directions: string[]
  cost?: string
  type?: string
  deadline_at?: string
}

const columnHelper = createColumnHelper<TaskTableRow>()

const TasksTable: FC<TasksTableProps> = ({ type, userId }) => {
  const { t } = useTranslation()
  const isHistoryTab = type === TaskTableTypes.HistoryTasks

  const [searchParams] = useSearchParams()
  const initialFilters = useMemo(() => {
    const sort_by = searchParams.get('sort_by')
    const sort_order = searchParams.get('sort_order') as 'asc' | 'desc'
    return {
      page: Number(searchParams.get('page')) || 1,
      per_page: Number(searchParams.get('per_page')) || 10,
      ...(sort_by ? { sort_by } : {}),
      ...(sort_order ? { sort_order } : {}),
      lang_pair: parseLanguagePairs(searchParams),
      type_classifier_value_id: searchParams.getAll('type_classifier_value_id'),
      ...(userId ? { institution_user_id: userId } : {}),
      ...(isHistoryTab || type === TaskTableTypes.VendorTasks
        ? {}
        : type === TaskTableTypes.MyTasks
        ? { assigned_to_me: 1 }
        : { assigned_to_me: 0 }),
      ...(type === TaskTableTypes.PendingTasks ? { is_candidate: 1 } : {}),
    }
  }, [isHistoryTab, searchParams, type, userId])

  const {
    tasks: myTasks,
    filters: myTasksFilters,
    isLoading: isLoadingMyTasks,
    paginationData: myTasksPaginationData,
    handleFilterChange: handleMyTasksFilterChange,
    handleSortingChange: handleMyTasksSortingChange,
    handlePaginationChange: handleMyTasksPaginationChange,
  } = useFetchTasks(
    {
      ...initialFilters,
    },
    true
  )

  const {
    historyTasks = [],
    filters: historyTasksFilters,
    isLoading: isLoadingHistoryTasks,
    paginationData: historyPaginationData,
    handleFilterChange: handleHistoryFilterChange,
    handleSortingChange: handleHistorySortingChange,
    handlePaginationChange: handleHistoryPaginationChange,
  } = useFetchHistoryTasks(
    { disabled: type !== TaskTableTypes.HistoryTasks, ...initialFilters },
    true
  )

  const {
    tasks,
    filters,
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } =
    useMemo(() => {
      switch (type) {
        case TaskTableTypes.MyTasks:
        case TaskTableTypes.PendingTasks:
        case TaskTableTypes.VendorTasks:
          return {
            tasks: myTasks,
            filters: myTasksFilters,
            isLoading: isLoadingMyTasks,
            paginationData: myTasksPaginationData,
            handleFilterChange: handleMyTasksFilterChange,
            handleSortingChange: handleMyTasksSortingChange,
            handlePaginationChange: handleMyTasksPaginationChange,
          }
        case TaskTableTypes.HistoryTasks: {
          return {
            tasks: historyTasks,
            filters: historyTasksFilters,
            isLoading: isLoadingHistoryTasks,
            paginationData: historyPaginationData,
            handleFilterChange: handleHistoryFilterChange,
            handleSortingChange: handleHistorySortingChange,
            handlePaginationChange: handleHistoryPaginationChange,
          }
        }
      }
    }, [
      handleHistoryFilterChange,
      handleHistoryPaginationChange,
      handleHistorySortingChange,
      handleMyTasksFilterChange,
      handleMyTasksPaginationChange,
      handleMyTasksSortingChange,
      historyPaginationData,
      historyTasks,
      historyTasksFilters,
      isLoadingHistoryTasks,
      isLoadingMyTasks,
      myTasks,
      myTasksFilters,
      myTasksPaginationData,
      type,
    ]) || {}

  const [filterModified, setFilterModified] = useState<boolean>(false)

  const {
    languageDirectionFilters,
    loadMore,
    handleSearch,
    setSelectedValues,
  } = useLanguageDirections({})
  const { classifierValuesFilters: typeFilters } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const {
    lang_pair,
    type_classifier_value_id,
    sort_by,
    sort_order,
    per_page,
    page,
  } = (filters || {}) as {
    lang_pair?: [{ src: string; dst: string }]
    type_classifier_value_id?: string
    sort_by?: string
    sort_order?: string
    per_page?: string
    page?: string
  }

  const defaultPaginationData = {
    per_page: Number(per_page),
    page: Number(page) - 1,
  }
  useEffect(() => {
    setSelectedValues(lang_pair ? lang_pair : [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang_pair])

  const tasksData = useMemo(() => {
    return reduce<
      ListTask,
      {
        ext_id: { id: string; ext_id: string; task_type: string }
        reference_number?: string
        language_directions: string[]
        cost?: string
        type?: string
        deadline_at?: string
      }[]
    >(
      tasks,
      (result, { id, assignment, project, task_type }) => {
        if (!assignment) {
          const {
            id: projectId,
            ext_id,
            reference_number,
            price,
            type_classifier_value,
            deadline_at,
            sub_projects,
          } = project

          const language_directions = map(
            sub_projects,
            ({
              source_language_classifier_value,
              destination_language_classifier_value,
            }) =>
              `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`
          )

          const taskData = {
            ext_id: { id: projectId, ext_id, task_type },
            reference_number: reference_number,
            language_directions: language_directions,
            cost: price,
            type: type_classifier_value?.name,
            deadline_at: deadline_at,
          }
          return [...result, taskData]
        }
        const { subProject, ext_id, deadline_at, price } = assignment
        const {
          project: mainProject,
          source_language_classifier_value,
          destination_language_classifier_value,
        } = subProject || {}
        const { type_classifier_value, reference_number } = mainProject || {}
        const taskData = {
          ext_id: { id, ext_id, task_type },
          reference_number: reference_number,
          language_directions: [
            `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`,
          ],
          cost: price,
          type: type_classifier_value?.name,
          deadline_at: deadline_at,
        }
        return [...result, taskData]
      },
      []
    )
  }, [tasks])

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      setFilterModified(true)

      const { language_direction, type_classifier_value_id, ...rest } =
        filters || {}

      const typedLanguageDirection = language_direction as string
      const typedClassifierValueId = type_classifier_value_id as string

      let langPair: { src: string; dst: string }[] = []
      if (typedLanguageDirection) {
        langPair = [
          {
            src: typedLanguageDirection?.split('_')[0],
            dst: typedLanguageDirection?.split('_')[1],
          },
        ]
      }

      const newFilters = {
        lang_pair: langPair,
        type_classifier_value_id: typedClassifierValueId
          ? [typedClassifierValueId]
          : '',
        ...rest,
      }

      if (handleFilterChange) {
        handleFilterChange(newFilters)
      }
    },
    [handleFilterChange]
  )

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('ext_id', {
          header: () => t('my_tasks.assignment_id'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => {
            const projectExtIdObject = getValue()
            const taskId = projectExtIdObject?.id
            const projectExtId = projectExtIdObject?.ext_id
            const taskType = projectExtIdObject?.task_type

            const href = ['CORRECTING', 'CLIENT_REVIEW'].includes(taskType)
              ? `/projects/${taskId}`
              : `/projects/my-tasks/${taskId}${
                  isHistoryTab ? '/isHistoryView' : ''
                }`

            return (
              <Button
                appearance={AppearanceTypes.Text}
                size={SizeTypes.M}
                icon={ArrowRight}
                ariaLabel={t('label.to_task_view')}
                iconPositioning={IconPositioningTypes.Left}
                href={href}
              >
                {projectExtId}
              </Button>
            )
          },
        }),
        columnHelper.accessor('reference_number', {
          header: () => t('label.associated_reference_number'),
          footer: (info) => info.column.id,
        }),
        columnHelper.accessor('language_directions', {
          header: () => t('label.language_directions'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => {
            return (
              <div className={classes.tagsRow}>
                {map(getValue(), (value, index) => (
                  <Tag label={value} value key={index} />
                ))}
              </div>
            )
          },
          meta: {
            filterOption: { language_direction: languageDirectionFilters },
            filterValue: map(
              lang_pair || [],
              ({ src, dst }) => `${src}_${dst ?? ''}`
            ),
            isCustomSingleDropdown: true,
            onEndReached: loadMore,
            onSearch: handleSearch,
            showSearch: true,
          },
        }),
        columnHelper.accessor('cost', {
          header: () => t('label.cost'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => (getValue() ? `${getValue()}€` : '-'),
        }),
        columnHelper.accessor('type', {
          header: () => t('label.type'),
          footer: (info) => info.column.id,
          meta: {
            filterOption: { type_classifier_value_id: typeFilters },
            filterValue: type_classifier_value_id,
            isCustomSingleDropdown: true,
          },
        }),
        columnHelper.accessor('deadline_at', {
          header: () => t('label.deadline_at'),
          footer: (info) => info.column.id,
          cell: ({ getValue }) => {
            const dateValue = getValue()
            const deadlineDate = dayjs(dateValue)
            const currentDate = dayjs()
            const diff = deadlineDate.diff(currentDate)
            const formattedDate = dayjs(dateValue).format('DD.MM.YYYY')

            const hasDeadlineError = diff < 0
            return (
              <span
                className={classNames(
                  classes.deadline,
                  hasDeadlineError && classes.error
                )}
              >
                {formattedDate}
              </span>
            )
          },
          meta: {
            sortingOption: ['asc', 'desc'],
            currentSorting: sort_by === 'deadline_at' ? sort_order : '',
          },
        }),
      ] as ColumnDef<TaskTableRow>[],
    [
      languageDirectionFilters,
      lang_pair,
      loadMore,
      handleSearch,
      typeFilters,
      type_classifier_value_id,
      sort_by,
      sort_order,
      t,
      isHistoryTab,
    ]
  )

  const showNoTasksMessage = isEmpty(tasks) && !filterModified

  if (isLoading) return <Loader loading={isLoading} />
  if (showNoTasksMessage)
    return <span className={classes.noTasks}>{t('my_tasks.no_tasks_yet')}</span>

  return (
    <Root>
      <DataTable
        data={tasksData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleModifiedFilterChange}
        onSortingChange={handleSortingChange}
        className={classes.topSection}
        defaultPaginationData={defaultPaginationData}
        pageSizeOptions={[
          { label: '10', value: '10' },
          { label: '15', value: '15' },
          { label: '50', value: '50' },
        ]}
      />
    </Root>
  )
}

export default TasksTable
