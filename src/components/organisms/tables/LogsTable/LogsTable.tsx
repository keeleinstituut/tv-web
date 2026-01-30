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
import ExpandIcon from 'assets/icons/expand.svg?react'
import ShrinkIcon from 'assets/icons/shrink.svg?react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import { AuditLogsResponse } from 'types/auditLogs'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'
import { get, map } from 'lodash'
import dayjs from 'dayjs'
import LogsSubRowTable, {
  SubRowAuditLog,
} from '../LogsSubRowTable/LogsSubRowTable'
import { NavLink } from 'react-router-dom'

export type AuditLog = {
  user?: string
  happened_at?: string
  event?: string
  event_type?: string
  institution_id?: string
  result?: string
  subRows?: SubRowAuditLog[]
  event_parameters?: any
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
  const pageSizeOptions = [
    { label: '15', value: '15' },
    { label: '50', value: '50' },
  ]
  const tableData: AuditLog[] = map(data as any, (record) => {
    const result = get(
      {
        '2': t('logs.successful'),
        '3': t('logs.successful'),
      },
      String(record.response_status_code)[0],
      t('logs.failed')
    )

    return {
      user: `${record.actor_name} (${record.actor_pic})`,
      // happened_at: record.happened_at,
      happened_at: dayjs(record.happened_at).format('YYYY.MM.DD HH:mm:ss'),
      result,
      event: t(`logs.event_type2.${record.action}` as any),
      subRows: [
        {
          label: t('logs.event_record.id'),
          Component: () => <span>{record.id}</span>,
        },
        {
          label: t('logs.event_record.action'),
          Component: () => (
            <pre>
              {t(`logs.event_type2.${record.action}` as any)} ({record.action})
            </pre>
          ),
        },
        {
          label: t('logs.event_record.happened_at'),
          Component: () => <pre>{record.happened_at}</pre>,
        },
        {
          label: t('logs.event_record.actor_pic'),
          Component: () => <pre>{record.actor_pic}</pre>,
        },
        {
          label: t('logs.event_record.actor_name'),
          Component: () => <pre>{record.actor_name}</pre>,
        },
        {
          label: t('logs.event_record.actor_session'),
          Component: () => <pre>{record.actor_session}</pre>,
        },
        {
          label: t('logs.event_record.path'),
          Component: () => <pre>{record.path}</pre>,
        },
        {
          label: t('logs.event_record.request_method'),
          Component: () => <pre>{record.request_method}</pre>,
        },
        {
          label: t('logs.event_record.web_path'),
          Component: () => (
            <NavLink
              style={{ textDecoration: 'underline' }}
              to={record.web_path}
              target="_blank"
            >
              {record.web_path}
            </NavLink>
          ),
        },
        {
          label: t('logs.event_record.response_status_code'),
          Component: () => <pre>{record.response_status_code}</pre>,
        },
        {
          label: t('logs.event_record.request_query'),
          Component: () => (
            <pre>{JSON.stringify(record.request_query, null, 2)}</pre>
          ),
        },
        {
          label: t('logs.event_record.request_body'),
          Component: () => (
            <pre>{JSON.stringify(record.request_body, null, 2)}</pre>
          ),
        },
      ],
    }
  })

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
    columnHelper.accessor('event', {
      header: () => (
        <span className={classes.header}>{t('logs.activity')}</span>
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
        getSubRows={(originalRow) => originalRow.subRows as any}
        subRowComponent={(row) => {
          return <LogsSubRowTable rowData={row.original} />
        }}
        tableSize={TableSizeTypes.S}
        className={classes.dataTable}
        getRowStyles={getRowStyles}
        tableWrapperClassName={classes.tableClassName}
        paginationData={paginationData}
        onPaginationChange={handlePaginationChange}
        pageSizeOptions={pageSizeOptions}
        defaultPaginationData={{ per_page: 15 }}
      />
    </Root>
  )
}

export default LogsTable
