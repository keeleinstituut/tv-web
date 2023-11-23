import { useCallback, useMemo, FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'

import classNames from 'classnames'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import {
  ColumnDef,
  createColumnHelper,
  PaginationState,
} from '@tanstack/react-table'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { AssignmentType, CandidateStatus } from 'types/assignments'

import classes from './classes.module.scss'
import { SubProjectFeatures } from 'types/projects'
import { useAssignmentRemoveVendor } from 'hooks/requests/useAssignments'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from '../Notification/Notification'

type TaskCandidatesSectionProps = Pick<
  AssignmentType,
  'id' | 'candidates' | 'job_definition'
> & {
  className?: string
}

interface CandidateRow {
  name: string
  status: CandidateStatus
  price: string
  // TODO: delete button should be disabled, once the workflow has started
  delete_button: string
}

const columnHelper = createColumnHelper<CandidateRow>()

const TaskCandidatesSection: FC<TaskCandidatesSectionProps> = ({
  id,
  candidates,
  className,
  job_definition,
}) => {
  const { t } = useTranslation()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10000,
  })

  const { deleteAssignmentVendor } = useAssignmentRemoveVendor({
    id,
  })

  const tableRows = useMemo(
    () =>
      map(candidates, ({ vendor, price, status }) => {
        const { institution_user } = vendor
        const name = `${institution_user?.user?.forename} ${institution_user?.user?.surname}`

        return {
          name,
          status,
          price,
          delete_button: vendor.id,
        }
      }),
    [candidates]
  )

  const handleDelete = useCallback(
    async (vendor_id: string) => {
      await deleteAssignmentVendor({ data: [{ vendor_id }] })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.vendors_removed_from_task'),
      })
    },
    [deleteAssignmentVendor, t]
  )

  const columns = [
    columnHelper.accessor('name', {
      header: () => t('label.name'),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: () => t('label.status'),
      footer: (info) => info.column.id,
      cell: ({ getValue }) => t(`candidate.status.${getValue()}`),
    }),
    columnHelper.accessor('price', {
      header: () => t('label.cost'),
      cell: ({ getValue }) => {
        const cost = getValue()
        return cost ? `${cost}€` : '-'
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('delete_button', {
      header: '',
      cell: ({ row, getValue }) => {
        const isEnabled = row.original.status === CandidateStatus.New
        return (
          <BaseButton
            className={classes.iconButton}
            hidden={job_definition.job_key === SubProjectFeatures.JobOverview}
            disabled={!isEnabled}
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
        pagination={pagination}
        setPagination={setPagination}
        hidePagination
        headComponent={<h4>{t('task.vendors')}</h4>}
      />
    </div>
  )
}

export default TaskCandidatesSection
