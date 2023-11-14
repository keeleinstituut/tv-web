import { FC } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ExpandIcon } from 'assets/icons/expand.svg'
import { ReactComponent as ShrinkIcon } from 'assets/icons/shrink.svg'
import data from 'components/organisms/tables/ExamplesTable/data.json'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import { AuditLogsResponse } from 'types/auditLogs'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'
import { join, map } from 'lodash'
import dayjs from 'dayjs'
import LogsSubRowTable from '../LogsSubRowTable/LogsSubRowTable'

type AuditLog = {
  user?: string
  happened_at?: string
  event_type?: string
  institution_id?: string
  result?: string
  changes?: object | string
  subRows?: AuditLog[]
  event_parameters?: unknown | object
}

type LogsTableProps = {
  data?: AuditLogsResponse[]
  hidden?: boolean
  paginationData?: ResponseMetaTypes
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const defaultData = data?.data || {}
const columnHelper = createColumnHelper<AuditLog>()

const LogsTable: FC<LogsTableProps> = ({
  data,
  hidden,
  paginationData,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()
  const tableData: AuditLog[] = map(
    defaultData,
    ({ id, firstName, lastName, status }) => {
      return {
        user: join([id, firstName, lastName], ','),
        happened_at: 'YYY:MM:DD',
        event_type: status,
        institution_id: id,
        result: status,
        subRows: [
          {
            reference_id: id,
            event_type: status,
            event_parameters: {
              pre_modification_subset: {},
              post_modification_subset: {},
              object_type: 'INSTITUTION',
              object_identity_subset: {
                id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                name: 'string',
              },
            },
          },
        ],
      }
    }
  )

  const columns = [
    columnHelper.accessor('user', {
      id: 'user',
      header: () => (
        <span className={classes.firstHeader}>{t('logs.user')}</span>
      ),
      cell: ({ row, getValue }) => (
        <div className={classes.row}>
          {row.getCanExpand() ? (
            <Button
              onClick={row.getToggleExpandedHandler()}
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={row.getIsExpanded() ? ShrinkIcon : ExpandIcon}
              iconPositioning={IconPositioningTypes.Left}
              className={
                row.getIsExpanded() ? classes.shrinkIcon : classes.expandedIcon
              }
            />
          ) : null}
          {getValue()}
        </div>
      ),
      size: 500,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('happened_at', {
      header: () => (
        <span className={classes.header}>{t('logs.date_change')}</span>
      ),
      cell: ({ getValue }) => <span>{getValue()}</span>,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('event_type', {
      header: () => (
        <span className={classes.header}>{t('logs.activity')}</span>
      ),
      cell: ({ getValue }) => getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('institution_id', {
      header: () => (
        <span className={classes.header}>
          {t('logs.department_account_id')}
        </span>
      ),
      cell: ({ getValue }) => getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('result', {
      header: () => <span className={classes.header}>{t('logs.result')}</span>,
      cell: ({ getValue }) => getValue(),
    }),
  ] as ColumnDef<AuditLog>[]

  const getRowStyles = (row: { parentId?: string }) => {
    return !row?.parentId ? { background: '#F0F0F2' } : {}
  }
  if (hidden) return null

  return (
    <Root>
      <DataTable
        data={tableData}
        columns={columns}
        getSubRows={(originalRow) => originalRow.subRows}
        subRowComponent={(row) => <LogsSubRowTable rowData={row.original} />}
        tableSize={TableSizeTypes.S}
        className={classes.dataTable}
        paginationLabelClassName={classes.paginationLabel}
        getRowStyles={getRowStyles}
        tableWrapperClassName={classes.tableClassName}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
      />
    </Root>
  )
}

export default LogsTable
