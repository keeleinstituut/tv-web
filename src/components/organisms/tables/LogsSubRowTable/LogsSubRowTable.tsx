import { FC } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import { createColumnHelper, ColumnDef } from '@tanstack/react-table'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import classNames from 'classnames'

type AuditLog = {
  reference_id?: string
  event_type?: string
  event_parameters?: object | string | unknown
}

type LogsSubRowTableProps = {
  rowData?: AuditLog
  hidden?: boolean
}

const columnHelper = createColumnHelper<AuditLog>()

const LogsSubRowTable: FC<LogsSubRowTableProps> = ({ rowData }) => {
  const { t } = useTranslation()

  const tableData: AuditLog[] = [
    {
      reference_id: rowData?.reference_id,
      event_type: rowData?.event_type,
      event_parameters: rowData?.event_parameters,
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
      size: 200,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('event_type', {
      header: () => (
        <span className={classes.header}>{t('logs.activity')}</span>
      ),
      cell: ({ getValue }) => getValue(),
      size: 200,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('event_parameters', {
      header: () => <span className={classes.header}>{t('logs.changes')}</span>,
      cell: ({ getValue }) => (
        <pre className="pre">{JSON.stringify(getValue(), null, 2)}</pre>
      ),
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
