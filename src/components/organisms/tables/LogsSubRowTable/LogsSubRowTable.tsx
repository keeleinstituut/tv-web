import { FC, useState } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import {
  createColumnHelper,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { includes, join, map, omit, pickBy, toLower } from 'lodash'
import { ObjectParameters } from 'types/auditLogs'
import { AuditLog } from '../LogsTable/LogsTable'

type SubRowAuditLog = {
  reference_id?: string
} & Pick<AuditLog, 'event' | 'event_type' | 'event_parameters'>

type LogsSubRowTableProps = {
  rowData?: SubRowAuditLog
  hidden?: boolean
}

const columnHelper = createColumnHelper<SubRowAuditLog>()

const LogsSubRowTable: FC<LogsSubRowTableProps> = ({ rowData }) => {
  const { t } = useTranslation()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10000,
  })

  const { event_type, event_parameters, event } = rowData || {}
  const isObjectLog = includes(event_type, 'OBJECT')
  const objectId = `(${toLower(event_parameters?.object_type)}-ID)`

  const tableData: SubRowAuditLog[] = [
    {
      reference_id: isObjectLog
        ? join([event_parameters?.object_identity_subset?.id, objectId], ' ')
        : '-',
      event,
      event_parameters: isObjectLog
        ? omit(event_parameters, 'object_type')
        : pickBy(event_parameters, (val) => !!val),
    },
  ]

  const columns = [
    columnHelper.accessor('reference_id', {
      header: () => (
        <span className={classNames(classes.header, classes.padding)}>
          {t('logs.reference')}
        </span>
      ),
      cell: ({ getValue }) => (
        <span className={classes.padding}>{getValue()}</span>
      ),
      size: 120,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('event', {
      header: () => (
        <span className={classes.header}>{t('logs.activity')}</span>
      ),
      cell: ({ getValue }) => getValue(),
      size: 100,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('event_parameters', {
      header: () => <span className={classes.header}>{t('logs.changes')}</span>,
      cell: ({ getValue }) => {
        if (isObjectLog) {
          const object = getValue() as ObjectParameters
          return (
            <div className={classes.objectContainer}>
              {map(
                object,
                (
                  value: keyof ObjectParameters,
                  key: keyof ObjectParameters
                ) => {
                  return (
                    <div key={key}>
                      <span className={classes.header}>{t(`logs.${key}`)}</span>
                      <pre>{JSON.stringify(value, null, 2)}</pre>
                    </div>
                  )
                }
              )}
            </div>
          )
        } else {
          return <pre>{JSON.stringify(getValue(), null, 2)}</pre>
        }
      },
      size: 600,
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<SubRowAuditLog>[]

  return (
    <DataTable
      data={tableData}
      columns={columns}
      className={classes.dataTable}
      tableSize={TableSizeTypes.S}
      hidePagination
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}

export default LogsSubRowTable
