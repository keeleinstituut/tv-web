import React, { CSSProperties, FC, ReactNode, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import classes from './styles.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Container from 'components/atoms/Container/Container'
import { ReactComponent as Arrow } from 'assets/icons/arrow_pagination.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

type Person = {
  firstName: string
  lastName: string
  age: number
  //   visits: number
  //   status: string
  //   progress: number
}

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    // visits: 100,
    // status: 'In Relationship',
    // progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    // visits: 40,
    // status: 'Single',
    // progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    // visits: 20,
    // status: 'Complicated',
    // progress: 10,
  },
  {
    firstName: 'tanner1',
    lastName: 'linsley',
    age: 24,
    // visits: 100,
    // status: 'In Relationship',
    // progress: 50,
  },
  {
    firstName: 'tandy1',
    lastName: 'miller',
    age: 40,
    // visits: 40,
    // status: 'Single',
    // progress: 80,
  },
  {
    firstName: 'joe1',
    lastName: 'dirte',
    age: 45,
    // visits: 20,
    // status: 'Complicated',
    // progress: 10,
  },
  {
    firstName: 'tanner2',
    lastName: 'linsley',
    age: 24,
    // visits: 100,
    // status: 'In Relationship',
    // progress: 50,
  },
  {
    firstName: 'tandy2',
    lastName: 'miller',
    age: 40,
    // visits: 40,
    // status: 'Single',
    // progress: 80,
  },
  {
    firstName: 'joe2',
    lastName: 'dirte',
    age: 45,
    // visits: 20,
    // status: 'Complicated',
    // progress: 10,
  },
]

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.accessor('firstName', {
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  //   columnHelper.accessor('visits', {
  //     header: () => <span>Visits</span>,
  //     footer: (info) => info.column.id,
  //   }),
  //   columnHelper.accessor('status', {
  //     header: 'Status',
  //     footer: (info) => info.column.id,
  //   }),
  //   columnHelper.accessor('progress', {
  //     header: 'Profile Progress',
  //     footer: (info) => info.column.id,
  //   }),
]
type DataTableProps = {
  //   data: any
  //   columns: ColumnDef<any, any>[]
  //tableBodyPrefix?: ReactNode
  sortable?: boolean
  filterable?: boolean
  pagination?: PaginationState
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>
  //   globalFilter?: string
  //   setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>
  //   columnVisibility?: VisibilityState
  //   setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>
  //   disableHead?: boolean
  //   meta?: TableMeta<any>
}

const DataTable: FC<DataTableProps> = ({}) => {
  const [data, setData] = React.useState(() => [...defaultData])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  })
  const id = useId()
  const { t } = useTranslation()

  const table = useReactTable({
    data,
    columns,
    state: {
      ...{ pagination },
    },
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Container>
      <h4 className={classes.title}>Pealkiri</h4>

      <div className={classes.tableWrapper}>
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {pagination && (
          <div className={classes.paginationWrapper}>
            {table.getPageCount() * table.getState().pagination.pageSize >
              table.getState().pagination.pageSize && (
              <div className={classes.pagination}>
                <Button
                  id="preview"
                  appearance={AppearanceTypes.Text}
                  size={SizeTypes.S}
                  icon={Arrow}
                  ariaLabel={t('label.button_arrow')}
                  iconPositioning={IconPositioningTypes.Left}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                />

                <nav
                  role="navigation"
                  //aria-label={t('global.paginationNavigation') || ''}
                >
                  <ul className={classes.links}>
                    {[...Array(table.getPageCount())].map((_, index) => (
                      <li
                        key={`${id}-${index}`}
                        className={classNames({
                          [classes.active]:
                            table.getState().pagination.pageIndex === index,
                        })}
                      >
                        <Link
                          className={classes.pageNumber}
                          to={`?page=${index + 1}`}
                          onClick={() => table.setPageIndex(index)}
                          //aria-label={t('global.gotoPage') + index}
                          aria-current={
                            table.getState().pagination.pageIndex === index
                          }
                        >
                          {index + 1}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <Button
                  // id="next"
                  appearance={AppearanceTypes.Text}
                  size={SizeTypes.S}
                  icon={Arrow}
                  ariaLabel={t('label.button_arrow')}
                  iconPositioning={IconPositioningTypes.Left}
                  onClick={() => {
                    table.nextPage()
                  }}
                  disabled={!table.getCanNextPage()}
                  className={classes.arrow}
                />
              </div>
            )}
            <div className={classes.pageSizeWrapper}>
              <label htmlFor={id} className={classes.pageSizeLabel}>
                {t('label.pagination_result_count')}
              </label>
              <select
                className={classes.pageSizeSelect}
                id={id}
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {[1, 2, 3, 4, 15].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default DataTable
