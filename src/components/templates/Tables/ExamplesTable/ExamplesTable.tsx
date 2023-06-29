import { FC, useState, HTMLProps, useEffect, useRef, useCallback } from 'react'
import DataTable, {
  TableSizeTypes,
} from 'components/organisms/DataTable/DataTable'
import {
  createColumnHelper,
  PaginationState,
  ColumnDef,
} from '@tanstack/react-table'
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
    pageSize: 10,
  })

  const handleColumnFiltersChange = useCallback(
    (filters: string | string[], columnId: string) => {
      //TODO add to endpoint
      //console.log('New column filters:', filters, columnId)
    },
    []
  )

  const onSortingChange = useCallback(
    (filters: string | string[], columnId: string) => {
      //TODO add to endpoint
      //console.log('column sorting:', filters, columnId)
    },
    []
  )

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
    }),
    columnHelper.accessor('age', {
      header: () => 'Age',
      cell: (info) => info.renderValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor('visits', {
      header: () => <span>Visits</span>,
      footer: (info) => info.column.id,
      meta: {
        //Example for adding sorting
        sortingOption: [
          { label: 'Tühjenda filtrid', value: 'clean' },
          { label: '€ - €€', value: 'asc' },
          { label: '€€ - €', value: 'desc' },
        ],
      },
    }),
    columnHelper.accessor('status', {
      header: () => 'Status',
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
      meta: {
        //Example for adding filter
        filterOption: [
          { label: 'Option 1', value: 'Option 1' },
          { label: 'Option 2', value: 'Option 2' },
          { label: 'Option 3', value: 'Option 3' },
          { label: 'Option 4', value: 'Option 4' },
          { label: 'Option 5', value: 'Option 5' },
          { label: 'Option 6', value: 'Option 6' },
          { label: 'Option ieruhiruthr7', value: 'Option 7' },
          { label: 'Option 8985759867', value: 'Option 8' },
        ],
      },
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
      //enableExpanding
      getSubRows={(originalRow) => originalRow.subRows}
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.S}
      onColumnFiltersChange={handleColumnFiltersChange}
      onSortingChange={onSortingChange}
    />
  )
}

export default ExamplesTable
