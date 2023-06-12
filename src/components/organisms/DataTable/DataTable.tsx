import React, { CSSProperties, ReactNode, useState } from 'react'
import classes from './styles.module.scss'
import classNames from 'classnames'
import {
  ExpandedState,
  getExpandedRowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  getPaginationRowModel,
  TableMeta,
  Row,
  RowData,
  ColumnDef,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'
import Container from 'components/atoms/Container/Container'
import TablePagination from 'components/organisms/TablePagination/TablePagination'
import TableHeaderGroup from 'components/organisms/TableHeaderGroup/TableHeaderGroup'

export enum TableSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
}

type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  tableSize: string
  title?: string
  tableBodyPrefix?: ReactNode
  sortable?: boolean
  setSorting?: React.Dispatch<React.SetStateAction<SortingState>>
  sorting?: SortingState
  // columnFilters?: ColumnFiltersState
  // setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  pagination?: PaginationState
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>
  meta?: TableMeta<TData>
  subRows?: Row<TData>[] | undefined
  getSubRows?:
    | ((originalRow: TData, index: number) => TData[] | undefined)
    | undefined
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties
  }
}

const DataTable = <TData extends object>({
  data,
  columns,
  tableSize = 'm',
  tableBodyPrefix,
  title,
  sortable,
  // sorting,
  // setSorting,
  // columnFilters,
  // setColumnFilters,
  pagination,
  setPagination,
  meta,
  getSubRows,
}: DataTableProps<TData>) => {
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      // sorting,
      // columnFilters,
      rowSelection,
      expanded,
      ...{ pagination },
    },
    meta,
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && { getSortedRowModel: getSortedRowModel() }),
    // onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    // onColumnFiltersChange: setColumnFilters,
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getSubRows: getSubRows,
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <Container>
      <h4 className={classes.title}>{title}</h4>
      <div className={classes.tableWrapper}>
        <table className={classNames(classes.dataTable, classes[tableSize])}>
          <TableHeaderGroup table={table} sortable={sortable} />
          <tbody>
            {tableBodyPrefix}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={table.options.meta?.getRowStyles(row)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination hidden={!pagination} table={table} />
      </div>
    </Container>
  )
}

export default DataTable
