import { FC } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import classNames from 'classnames'
import { includes, join, map, omit, pickBy, toLower } from 'lodash'
import { EventParameters, ObjectParameters } from 'types/auditLogs'

type AuditLog = {
  reference_id?: string
  event_type?: string
  event?: string
  event_parameters?: EventParameters | null
}

type LogsSubRowTableProps = {
  rowData?: AuditLog
  hidden?: boolean
}

const columnHelper = createColumnHelper<AuditLog>()

const LogsSubRowTable: FC<LogsSubRowTableProps> = ({ rowData }) => {
  const { t } = useTranslation()

  const { event_type, event_parameters, event } = rowData || {}
  const isObjectLog = includes(event_type, 'OBJECT')
  const objectId = `(${toLower(event_parameters?.object_type)}-ID)`

  const tableData: AuditLog[] = [
    {
      reference_id: isObjectLog
        ? join([event_parameters?.object_identity_subset?.id, objectId], ' ')
        : '-',
      event_type: event,
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
    columnHelper.accessor('event_type', {
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
                    <div>
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
  ] as ColumnDef<AuditLog>[]

  return (
    <Root>
      <DataTable
        data={tableData}
        columns={columns}
        className={classes.dataTable}
        tableSize={TableSizeTypes.S}
        hidePagination
      />
    </Root>
  )
}

export default LogsSubRowTable
