import { FC, useState, HTMLProps, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import DataTable, {
  TableSizeTypes,
} from 'components/templates/DataTable/DataTable'

import { createColumnHelper, PaginationState } from '@tanstack/react-table'
import TableFilter from 'components/organisms/TableFilter/TableFilter'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as ExpandIcon } from 'assets/icons/expand.svg'
import { ReactComponent as ArrowRight } from 'assets/icons/arrow_right.svg'
import { Link } from 'react-router-dom'

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

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

const defaultData: Person[] = [
  {
    id: 'xxxx1',
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
    subRows: [
      {
        id: 'xxxx12',
        firstName: 'tanddy',
        lastName: 'mikker',
        age: 40,
        visits: 40,
        status: 'married',
        progress: 80,
        subRows: [
          {
            id: 'xxxx123',
            firstName: 'kalle',
            lastName: 'talle',
            age: 41,
            visits: 40,
            status: 'Single',
            progress: 80,
          },
        ],
      },
      {
        id: 'xxxx12',
        firstName: 'joel',
        lastName: 'dirte',
        age: 45,
        visits: 20,
        status: 'Complicated',
        progress: 10,
      },
      {
        id: 'xxxx13',
        firstName: 'tanner1',
        lastName: 'linsley',
        age: 24,
        visits: 100,
        status: 'In Relationship',
        progress: 50,
      },
    ],
  },
  {
    id: 'xxxx2',
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    id: 'xxxx3',
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
  {
    id: 'xxxx4',
    firstName: 'tanner1',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    id: 'xxxx5',
    firstName: 'tandy1',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    id: 'xxxx6',
    firstName: 'joe1',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
  {
    id: 'xxxx7',
    firstName: 'tanner2',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    id: 'xxxx8',
    firstName: 'tandy2',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    id: 'xxxx9',
    firstName: 'joe2',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.accessor('id', {
    header: () => 'Id',
    cell: ({ row, getValue }) => (
      //Example for link row cell
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          width: 'max-content',
          gap: '10px',
          alignItems: 'left',
        }}
      >
        <Button
          appearance={AppearanceTypes.Text}
          size={SizeTypes.M}
          icon={ArrowRight}
          // ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Left}
        >
          <Link to={'/dashboard'}>{getValue()}</Link>
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
      <div
        style={{
          // Since rows are flattened by default,
          // we can use the row.depth property
          // and paddingLeft to visually indicate the depth
          // of the row
          paddingLeft: `${row.depth * 2}rem`,
          display: 'grid',
          gridAutoFlow: 'column',
          width: 'max-content',
          gap: '10px',
          alignItems: 'left',
        }}
      >
        {/* //Exaple for row checkbox */}
        <>
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
          {/* //Exaple for expandable row in the data there have to be subRows */}
          {row.getCanExpand() ? (
            <Button
              onClick={row.getToggleExpandedHandler()}
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={ExpandIcon}
              // ariaLabel={t('label.button_arrow')}
              iconPositioning={IconPositioningTypes.Left}
            />
          ) : null}
          {getValue()}
        </>
      </div>
    ),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => <i>{info.getValue()}</i>,
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
    // cell: ({ getValue, row: { index }, column: { id }, table }) => {
    //   const initialValue = getValue()
    //   // We need to keep and update the state of the cell normally
    //   const [value, setValue] = useState(initialValue)

    //   // When the input is blurred, we'll call our table meta's updateData function
    //   const onBlur = () => {
    //     table.options.meta?.updateData(index, id, value)
    //   }

    //   // If the initialValue is changed external, sync it up with our state
    //   useEffect(() => {
    //     setValue(initialValue)
    //   }, [initialValue])

    //   return (
    //     <input
    //       value={value as string}
    //       onChange={(e) => setValue(e.target.value)}
    //       onBlur={onBlur}
    //     />
    //   )
    // },
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: ({ table, column }) => (
      //One example how to add filter component
      <>
        Status
        <TableFilter table={table} column={column} />
      </>
    ),
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
]

const TestingTable: FC = () => {
  const { t } = useTranslation()

  const [data, setData] = useState(() => [...defaultData])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  })

  return (
    <DataTable
      data={data}
      columns={columns}
      sortable
      filterable
      // globalFilter={filter}
      // setGlobalFilter={setFilter}
      pagination={pagination}
      setPagination={setPagination}
      tableSize={TableSizeTypes.S}
    />
  )
}

export default TestingTable
