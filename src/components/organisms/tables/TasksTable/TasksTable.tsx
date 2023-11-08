import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { includes, map } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import classes from './classes.module.scss'
import { Root } from '@radix-ui/react-form'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import dayjs from 'dayjs'
import useAuth from 'hooks/useAuth'
import { useFetchTasks } from 'hooks/requests/useTasks'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import classNames from 'classnames'

type TaskTableRow = {
  ext_id: { id: string; ext_id: string }
  reference_number: string
  language_directions: string
  cost: string
  type: string
  deadline_at: string
  status?: OrderStatus
}

//TODO: fetch assigned to me tasks - {assigned_to_me: 1} and history

const TasksTable: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})

  const {
    tasks,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks({ assigned_to_me: 0 })

  const tasksData = useMemo(
    () =>
      map(tasks, ({ id, assignment }) => {
        const subProject = assignment.subProject
        return {
          ext_id: { id: id, ext_id: assignment.ext_id },
          reference_number: subProject.project.reference_number,
          language_directions: `${subProject.source_language_classifier_value?.value} > ${subProject.destination_language_classifier_value?.value}`,
          cost: subProject.price,
          type: subProject.project.type_classifier_value.name,
          deadline_at: subProject.project.deadline_at,
        }
      }),
    [tasks]
  )

  console.log('tasksData', tasksData)

  const columnHelper = createColumnHelper<TaskTableRow>()

  const columns = [
    columnHelper.accessor('ext_id', {
      header: () => t('my_tasks.assignment_id'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const ext_id = getValue() as { id: string; ext_id: string }
        return (
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            ariaLabel={t('label.to_task_view')}
            iconPositioning={IconPositioningTypes.Left}
            // disabled={
            //   !includes(userPrivileges, Privileges.ViewInstitutionProjectDetail)
            // }
            href={`/orders/my-tasks/${ext_id.id}`}
          >
            {ext_id.ext_id}
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
        const label = getValue() as string
        return (
          <div className={classes.tagsRow}>
            <Tag label={label} value />
          </div>
        )
      },
      meta: {
        filterOption: { language_direction: languageDirectionFilters },
        onEndReached: loadMore,
        onSearch: handleSearch,
        showSearch: true,
      },
    }),
    columnHelper.accessor('cost', {
      header: () => t('label.cost'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('type', {
      header: () => t('label.type'),
      footer: (info) => info.column.id,
      meta: {
        filterOption: { tag_id: tasks }, // TODO: add correct filtering options
      },
    }),
    columnHelper.accessor('deadline_at', {
      header: () => t('label.deadline_at'),
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const dateValue = getValue() as string
        const deadlineDate = dayjs(dateValue)
        const currentDate = dayjs()
        const diff = deadlineDate.diff(currentDate)
        const formattedDate = dayjs(dateValue).format('DD.MM.YYYY')
        const rowStatus = row.original.status

        //TODO: check from wiki hasDeadlineError OrderStatus requirements

        const hasDeadlineError =
          diff < 0 &&
          !includes(
            [
              OrderStatus.Forwarded,
              OrderStatus.Accepted,
              OrderStatus.Cancelled,
              OrderStatus.Corrected,
            ],
            rowStatus
          )
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
  ] as ColumnDef<TaskTableRow>[]

  return (
    <Root>
      <DataTable
        data={tasksData}
        columns={columns}
        tableSize={TableSizeTypes.M}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        onFiltersChange={handleFilterChange}
        onSortingChange={handleSortingChange}
        className={classes.topSection}
      />
    </Root>
  )
}

export default TasksTable
