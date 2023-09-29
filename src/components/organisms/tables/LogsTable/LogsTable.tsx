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

type Person = {
  id: string
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
  subRows?: Person[]
}

const defaultData: Person[] = data?.data || {}
const columnHelper = createColumnHelper<Person>()

const LogsTable: FC = () => {
  const { t } = useTranslation()
  const tableData = defaultData

  const columns = [
    columnHelper.accessor((row) => row.lastName, {
      id: 'lastName',
      header: () => <span className={classes.header}>{t('logs.user')}</span>,
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
                row.getIsExpanded()
                  ? classes.shrinkedIcon
                  : classes.expandedIcon
              }
            />
          ) : null}
          {getValue()}
        </div>
      ),

      meta: {
        sortingOption: [
          { label: 'Tühjenda filtrid', value: 'clean' },
          { label: '€ - €€', value: 'asc' },
          { label: '€€ - €', value: 'desc' },
        ],
      },
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('id', {
      header: () => <span className={classes.header}>Tegevus</span>,
      cell: ({ getValue }) => getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('id', {
      header: () => <span className={classes.header}>Väli</span>,
      cell: ({ getValue }) => getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('firstName', {
      header: () => (
        <span className={classes.header}>{t('logs.date_change')}</span>
      ),
      cell: ({ getValue }) => <span>{getValue()}</span>,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('firstName', {
      header: () => (
        <span className={classes.header}>{t('logs.activity')}</span>
      ),
      cell: ({ getValue }) => getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('age', {
      header: () => (
        <span className={classes.header}>
          {t('logs.department_account_id')}
        </span>
      ),
      cell: ({ getValue }) => getValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('visits', {
      header: () => <span className={classes.header}>{t('logs.result')}</span>,
      cell: ({ getValue }) => getValue(),
      meta: {
        sortingOption: [
          { label: 'Tühjenda filtrid', value: 'clean' },
          { label: '€ - €€', value: 'asc' },
          { label: '€€ - €', value: 'desc' },
        ],
      },
    }),
  ] as ColumnDef<Person>[]

  const getRowStyles = (row: {
    parentId?: string
    getIsExpanded?: () => boolean
    index?: number
  }) => {
    const isParentRow = row?.parentId === undefined
    const isExpanded = row.getIsExpanded?.()

    return isExpanded
      ? { background: '#E1E2E5' }
      : isParentRow
      ? { background: '#F0F0F2' }
      : { fontSize: 14 }
  }

  return (
    <DataTable
      data={tableData}
      columns={columns}
      getSubRows={(originalRow) => originalRow.subRows}
      className={classes.dataTable}
      tableSize={TableSizeTypes.S}
      //onSortingChange={onSortingChange}
      paginationLabelClassName={classes.paginationLabel}
      getRowStyles={getRowStyles}
      tableWrapperClassName={classes.tableClassName}
    />
  )
}

export default LogsTable
