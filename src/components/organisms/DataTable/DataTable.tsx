import { CSSProperties, useState } from 'react'
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
  OnChangeFn,
} from '@tanstack/react-table'
import { Root } from '@radix-ui/react-form'
import Container from 'components/atoms/Container/Container'
import TablePagination from 'components/organisms/TablePagination/TablePagination'
import TableHeaderGroup, {
  HeaderGroupFunctions,
} from 'components/organisms/TableHeaderGroup/TableHeaderGroup'

export enum TableSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
}

type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  tableSize: TableSizeTypes
  title?: string
  pagination?: PaginationState
  setPagination?: OnChangeFn<PaginationState>
  meta?: TableMeta<TData>
  subRows?: Row<TData>[] | undefined
  getSubRows?:
    | ((originalRow: TData, index: number) => TData[] | undefined)
    | undefined
} & HeaderGroupFunctions

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties
  }
}

const DataTable = <TData extends object>({
  data,
  columns,
  tableSize = TableSizeTypes.M,
  title,
  onSortingChange,
  onColumnFiltersChange,
  pagination,
  setPagination,
  meta,
  getSubRows,
}: DataTableProps<TData>) => {
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      expanded,
      ...{ pagination },
    },
    meta,
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onExpandedChange: setExpanded,
    getSubRows: getSubRows,
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <Root>
      <Container>
        <h4 className={classes.title}>{title}</h4>
        <div className={classes.tableWrapper}>
          <table className={classNames(classes.dataTable, classes[tableSize])}>
            <TableHeaderGroup
              table={table}
              onSortingChange={onSortingChange}
              onColumnFiltersChange={onColumnFiltersChange}
            />
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={table.options.meta?.getRowStyles(row)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination hidden={!pagination} table={table} />
        </div>
      </Container>
    </Root>
  )
}

export default DataTable
