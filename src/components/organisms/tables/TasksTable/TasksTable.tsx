import { FC, useCallback, useMemo, useState } from 'react'
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
import { TasksTableProps } from 'pages/MyTasks/MyTasks'
import { ListTask } from 'types/tasks'

import classes from './classes.module.scss'

type TaskTableRow = {
  ext_id: {
    id: string
    ext_id: string
  }
  reference_number?: string
  language_directions: string
  cost?: string
  type?: string
  deadline_at?: string
}

const columnHelper = createColumnHelper<TaskTableRow>()

const TasksTable: FC<TasksTableProps> = ({
  tasks,
  isLoading,
  filters,
  paginationData,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
  isHistoryTab,
}) => {
  const { t } = useTranslation()

  const [filterModified, setFilterModified] = useState<boolean>(false)

  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})
  const { classifierValuesFilters: typeFilters } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const { lang_pair, type_classifier_value_id } = (filters || {}) as {
    lang_pair?: { src: string; dst: string }
    type_classifier_value_id?: string
  }

  const tasksData = useMemo(() => {
    return reduce<
      ListTask,
      {
        ext_id: { id: string; ext_id: string }
        reference_number?: string
        language_directions: string
        cost?: string
        type?: string
        deadline_at?: string
      }[]
    >(
      tasks,
      (result, { id, assignment }) => {
        // TODO: add handling for REVIEW, CLIENT_REVIEW and CORRECTION tasks
        if (!assignment) {
          return result
        }
        const { subProject, ext_id, deadline_at, price } = assignment
        const {
          project,
          source_language_classifier_value,
          destination_language_classifier_value,
        } = subProject || {}
        const { type_classifier_value, reference_number } = project || {}
        const taskData = {
          ext_id: { id, ext_id },
          reference_number: reference_number,
          language_directions: `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`,
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

      const langPair = {
        0: {
          src: typedLanguageDirection?.split('_')[0],
          dst: typedLanguageDirection?.split('_')[1],
        },
      }

      const newFilters = {
        lang_pair: langPair,
        type_classifier_value_id: [typedClassifierValueId],
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

            return (
              <Button
                appearance={AppearanceTypes.Text}
                size={SizeTypes.M}
                icon={ArrowRight}
                ariaLabel={t('label.to_task_view')}
                iconPositioning={IconPositioningTypes.Left}
                href={`/projects/my-tasks/${taskId}${
                  isHistoryTab ? '/isHistoryView' : ''
                }     `}
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
            const label = getValue()
            return (
              <div className={classes.tagsRow}>
                <Tag label={label} value />
              </div>
            )
          },
          meta: {
            filterOption: { language_direction: languageDirectionFilters },
            filterValue: map(
              lang_pair || {},
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
          },
        }),
      ] as ColumnDef<TaskTableRow>[],
    [
      t,
      isHistoryTab,
      languageDirectionFilters,
      lang_pair,
      typeFilters,
      type_classifier_value_id,
      loadMore,
      handleSearch,
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
      />
    </Root>
  )
}

export default TasksTable
