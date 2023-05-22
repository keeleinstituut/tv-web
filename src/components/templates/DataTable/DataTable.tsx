import React, { CSSProperties, FC, useId, useState } from 'react'
import classes from './styles.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
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
  FilterFn,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils'
import Container from 'components/atoms/Container/Container'
import { ReactComponent as SortingArrows } from 'assets/icons/sorting_arrows.svg'

import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import TableFilter from 'components/organisms/TableFilter/TableFilter'
import TablePagination from 'components/organisms/TablePagination/TablePagination'

export enum TableSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
}

type DataTableProps = {
  data: any
  columns: ColumnDef<any, any>[]
  //tableBodyPrefix?: ReactNode
  sortable?: boolean
  filterable?: boolean
  pagination?: PaginationState
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>
  globalFilter?: string
  setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>
  //   columnVisibility?: VisibilityState
  //   setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>
  //   disableHead?: boolean
  meta?: TableMeta<any>
  tableSize: string
}

type ColumnMeta = {
  meta: {
    size: number | string
  }
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }

  interface FilterMeta {
    itemRank: RankingInfo
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties
  }
}
type CustomColumnDef = ColumnDef<any> & ColumnMeta

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank,
  })
  return itemRank.passed
}

const DataTable: FC<DataTableProps> = ({
  data,
  columns,
  tableSize = 'm',
  // tableBodyPrefix,
  sortable,
  filterable,
  pagination,
  setPagination,
  globalFilter,
  setGlobalFilter,
  // columnVisibility,
  // setColumnVisibility,
  // disableHead,
  meta,
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [rowSelection, setRowSelection] = React.useState({})
  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const id = useId()
  const { t } = useTranslation()

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      expanded,
      ...{ pagination },
    },
    meta,
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && { getSortedRowModel: getSortedRowModel() }),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <Container>
      <h4 className={classes.title}>Pealkiri</h4>

      <div className={classes.tableWrapper}>
        <table className={classNames(classes.dataTable, classes[tableSize])}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  console.log('jou', header.column.getIsSorted() as string)
                  return (
                    <th
                      key={header.id}
                      style={{
                        width: (header.column.columnDef as CustomColumnDef).meta
                          ?.size,
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className={classes.headingWrapper}>
                          {sortable && header.column.getCanSort() && (
                            <Button
                              onClick={header.column.getToggleSortingHandler()}
                              appearance={AppearanceTypes.Text}
                              size={SizeTypes.S}
                              icon={SortingArrows}
                              ariaLabel={t('label.button_arrow')}
                              iconPositioning={IconPositioningTypes.Left}
                            />
                          )}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {filterable && header.column.getCanFilter() && (
                            <TableFilter column={header.column} table={table} />
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
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
