import { FC, useState, HTMLProps, useEffect, useRef } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'

import {
  createColumnHelper,
  PaginationState,
  ColumnDef,
} from '@tanstack/react-table'
import TableFilter from 'components/organisms/TableColumnFilter/TableColumnFilter'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ExpandIcon } from 'assets/icons/expand.svg'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import data from 'components/templates/Tables/ExamplesTable/data.json'
import classes from './styles.module.scss'

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

//TODO: This is an example, for table we use our own checkbox component
function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (typeof indeterminate === 'boolean' && !!ref.current) {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate, rest.checked])

  return <input type="checkbox" ref={ref} className={className} {...rest} />
}

const defaultData: Person[] = data?.data || {}
const columnHelper = createColumnHelper<Person>()

const ExamplesTable: FC = () => {
  const tableData = defaultData
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  const columns = [
    columnHelper.accessor('id', {
      header: () => 'Id',
      cell: ({ row, getValue }) => (
        //Example for link row cell
        <div className={classes.row}>
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.M}
            icon={ArrowRight}
            iconPositioning={IconPositioningTypes.Left}
            href={'/dashboard'} //Change for correct link
          >
            {getValue()}
          </Button>
        </div>
      ),
      footer: (info) => info.column.id,
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor('firstName', {
      header: ({ table }) => (
        //Example for header checkbox
        <>
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
          First Name
        </>
      ),
      cell: ({ row, getValue }) => (
        <div className={classes.row}>
          {/* //Example for row checkbox, but use our own checkbox component*/}
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
          {getValue()}
        </div>
      ),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor((row) => row.lastName, {
      id: 'lastName',
      cell: ({ row, getValue }) => (
        <div
          className={classes.row}
          style={{
            // Since rows are flattened by default,
            // we can use the row.depth property
            // and paddingLeft to visually indicate the depth
            // of the row
            paddingLeft: `${row.depth * 2}rem`,
          }}
        >
          {/* //Example for expandable row. In the data there have to be subRows */}
          {row.getCanExpand() ? (
            <Button
              onClick={row.getToggleExpandedHandler()}
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={ExpandIcon}
              iconPositioning={IconPositioningTypes.Left}
            />
          ) : null}
          {getValue()}
        </div>
      ),
      header: () => <span>Last Name</span>,
      footer: (info) => info.column.id,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('age', {
      header: () => 'Age',
      cell: (info) => info.renderValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('visits', {
      header: () => <span>Visits</span>,
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('status', {
      header: ({ table, column }) => {
        const filterOption = ['single', 'complicated', 'married']
        return (
          //One example how to add filter component
          <>
            Status
            <TableFilter filterOption={filterOption} column={column} />
          </>
        )
      },
      footer: (info) => info.column.id,
      cell: ({ row, getValue }) => {
        //Here comes label/tag component
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              border: '1px solid red',
            }}
          >
            {getValue()}
          </div>
        )
      },
      enableColumnFilter: false,
    }),
    columnHelper.accessor('progress', {
      header: 'Profile Progress',
      footer: (info) => info.column.id,
    }),
  ] as ColumnDef<Person>[]

  return (
    <DataTable
      data={tableData}
      columns={columns}
      sortable
      //enableExpanding
      getSubRows={(originalRow) => originalRow.subRows}
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.S}
    />
  )
}

export default ExamplesTable
