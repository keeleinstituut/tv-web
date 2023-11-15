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
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import { AuditLogsResponse, EventParameters } from 'types/auditLogs'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'
import { includes, join, map } from 'lodash'
import dayjs from 'dayjs'
import LogsSubRowTable from '../LogsSubRowTable/LogsSubRowTable'

type AuditLog = {
  user?: string
  happened_at?: string
  event_type: string
  institution_id?: string
  result?: string
  subRows?: AuditLog[]
  event_parameters?: EventParameters | null
}

type LogsTableProps = {
  data?: AuditLogsResponse[]
  hidden?: boolean
  paginationData?: ResponseMetaTypes
  handlePaginationChange?: (value?: PaginationFunctionType) => void
}

const columnHelper = createColumnHelper<AuditLog>()

const LogsTable: FC<LogsTableProps> = ({
  data,
  hidden,
  paginationData,
  handlePaginationChange,
}) => {
  const { t } = useTranslation()
  const tableData: AuditLog[] = map(
    data,
    ({
      id,
      event_type,
      happened_at,
      context_institution_id,
      acting_user_forename,
      acting_user_surname,
      acting_user_pic,
      failure_type,
      event_parameters,
    }) => {
      const name = `${acting_user_forename} ${acting_user_surname}`
      const hasSubRow = !includes(
        ['LOG_IN', 'LOG_OUT', 'EXPORT_INSTITUTION_USERS', 'SELECT_INSTITUTION'],
        event_type
      )
      return {
        user: join([id, name, acting_user_pic], ', '),
        happened_at: dayjs(happened_at).format('YYYY.MM.DD HH:mm:ss'),
        event_type: t(`logs.event_type.${event_type}`),
        institution_id: context_institution_id,
        result: !failure_type ? t('logs.successful') : t('logs.failed'),
        ...(hasSubRow
          ? {
              subRows: [
                {
                  event: t(`logs.event_type.${event_type}`),
                  event_type,
                  event_parameters,
                },
              ],
            }
          : {}),
      }
    }
  )

  const columns = [
    columnHelper.accessor('user', {
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
