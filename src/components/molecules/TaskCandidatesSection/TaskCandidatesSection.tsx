import { useCallback, useMemo, FC } from 'react'
import { useTranslation } from 'react-i18next'
import { map, isEmpty } from 'lodash'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'

import classNames from 'classnames'
import dayjs from 'dayjs'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { AssignmentStatus, AssignmentType } from 'types/assignments'

import classes from './classes.module.scss'

// TODO: very similar to OrderFilesList, these 2 can be unified

type TaskCandidatesSectionProps = Pick<
  AssignmentType,
  'assigned_vendor_id' | 'candidates' | 'assignee_id' | 'finished_at'
> & {
  className?: string
}

interface CandidateRow {
  name: string
  status: AssignmentStatus
  price: string
  // TODO: delete button should be disabled, once the workflow has started
  delete_button: string
}

const columnHelper = createColumnHelper<CandidateRow>()

const TaskCandidatesSection: FC<TaskCandidatesSectionProps> = ({
  assigned_vendor_id,
  candidates,
  assignee_id,
  finished_at,
  className,
}) => {
  const { t } = useTranslation()

  const getCandidateStatus = useCallback(
    (vendor_id: string) => {
      if (!assignee_id) return AssignmentStatus.ForwardedToVendor
      if (assigned_vendor_id === vendor_id && finished_at)
        return AssignmentStatus.Done
      if (assigned_vendor_id === vendor_id) return AssignmentStatus.InProgress
      return AssignmentStatus.NotAssigned
    },
    [assigned_vendor_id, assignee_id, finished_at]
  )

  const tableRows = useMemo(
    () =>
      map(candidates, ({ vendor, price, vendor_id, id }) => {
        const { institution_user } = vendor
        const name = `${institution_user.user.forename} ${institution_user.user.surname}`
        const status = getCandidateStatus(vendor_id)

        return {
          name,
          status,
          price,
          delete_button: id,
        }
      }),
    [candidates, getCandidateStatus]
  )

  const handleDelete = useCallback((candidateId: string) => {
    // TODO: remove candidate with id: candidateId from this task
  }, [])

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => t(`task.status.${getValue()}`),
    }),
    columnHelper.accessor('price', {
      header: () => t('label.cost'),
      cell: ({ getValue }) => {
        const cost = getValue()
        return cost ? `${cost}€` : ''
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('delete_button', {
      header: '',
      cell: ({ getValue }) => {
        return (
          <BaseButton
            className={classes.iconButton}
            onClick={() => handleDelete(getValue())}
          >
            <Delete />
          </BaseButton>
        )
      },
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<CandidateRow>[]

  return (
    <div className={classNames(classes.container, className)}>
      <DataTable
        data={tableRows}
        columns={columns}
        tableSize={TableSizeTypes.M}
        className={classes.tableContainer}
        hidePagination
        headComponent={<h4>{t('task.vendors')}</h4>}
      />
    </div>
  )
}

export default TaskCandidatesSection
