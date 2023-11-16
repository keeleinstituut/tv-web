import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { includes, isEmpty, map, split } from 'lodash'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { Root } from '@radix-ui/react-form'
import { OrderStatus } from 'types/orders'
import Tag from 'components/atoms/Tag/Tag'
import dayjs from 'dayjs'
import useAuth from 'hooks/useAuth'
import { useLanguageDirections } from 'hooks/requests/useLanguageDirections'
import classNames from 'classnames'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { FilterFunctionType } from 'types/collective'
import Loader from 'components/atoms/Loader/Loader'
import { TasksTableProps } from 'pages/MyTasks/MyTasks'

import classes from './classes.module.scss'

type TaskTableRow = {
  ext_id: { id: string; ext_id: string | undefined }
  reference_number: string | undefined
  language_directions: string
  cost: number | undefined
  type: string | undefined
  deadline_at: string | undefined
  status?: OrderStatus
}

const TasksTable: FC<TasksTableProps> = ({
  tasks,
  isLoading,
  paginationData,
  handleFilterChange,
  handleSortingChange,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { languageDirectionFilters, loadMore, handleSearch } =
    useLanguageDirections({})
  const { classifierValuesFilters: typeFilters } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })

  const tasksData = useMemo(
    () =>
      map(tasks, ({ id, assignment }) => {
        const { subProject, ext_id } = assignment || {}
        const {
          project,
          source_language_classifier_value,
          destination_language_classifier_value,
          price,
        } = subProject || {}
        const { deadline_at, type_classifier_value, reference_number } =
          project || {}
        return {
          ext_id: { id: id, ext_id: ext_id },
          reference_number: reference_number,
          language_directions: `${source_language_classifier_value?.value} > ${destination_language_classifier_value?.value}`,
          cost: price,
          type: type_classifier_value?.name,
          deadline_at: deadline_at,
        }
      }),
    [tasks]
  )

  const handleModifiedFilterChange = useCallback(
    (filters?: FilterFunctionType) => {
      const { language_direction, type_classifier_value_id, ...rest } =
        filters || {}
      const typedLanguageDirection = language_direction as string[]

      const langPair = map(
        typedLanguageDirection,
        (languageDirectionString) => {
          const [src, dst] = split(languageDirectionString, '_')
          return { src, dst }
        }
      )

      const newFilters = {
        lang_pair: langPair,
        ...rest,
      }

      const newTypeFilters = {
        type_classifier_value_id: type_classifier_value_id,
      }

      if (handleFilterChange) {
        // handleFilterChange(newTypeFilters)
        handleFilterChange(newFilters)
      }
    },
    [handleFilterChange]
  )

  const columnHelper = createColumnHelper<TaskTableRow>()

  const columns = [
    columnHelper.accessor('ext_id', {
      header: () => t('my_tasks.assignment_id'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => {
        const ext_id = getValue()
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
        const label = getValue()
        return (
          <div className={classes.tagsRow}>
            <Tag label={label} value />
          </div>
        )
      },
      meta: {
        filterOption: { language_direction: languageDirectionFilters },
        multiple: false,
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
        filterOption: { type_classifier_value_id: typeFilters },
        multiple: false,
      },
    }),
    columnHelper.accessor('deadline_at', {
      header: () => t('label.deadline_at'),
      footer: (info) => info.column.id,
      cell: ({ getValue, row }) => {
        const dateValue = getValue()
        const deadlineDate = dayjs(dateValue)
        const currentDate = dayjs()
        const diff = deadlineDate.diff(currentDate)
        const formattedDate = dayjs(dateValue).format('DD.MM.YYYY')
        const rowStatus = row.original.status

        console.log('row', row)
        console.log('rowStatus', rowStatus)

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

  if (isLoading) return <Loader loading={isLoading} />
  if (isEmpty(tasks))
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
