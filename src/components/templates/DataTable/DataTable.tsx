import React, { CSSProperties, FC, useId, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { ReactComponent as Arrow } from 'assets/icons/arrow_pagination.svg'
import { ReactComponent as SortingArrows } from 'assets/icons/sorting_arrows.svg'

import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import TableFilter from 'components/organisms/TableFilter/TableFilter'

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
        {pagination && (
          <div className={classes.paginationWrapper}>
            {table.getPageCount() * table.getState().pagination.pageSize >
              table.getState().pagination.pageSize && (
              <div className={classes.pagination}>
                <Button
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
                  aria-label={t('label.pagination_navigation') || ''}
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
                          aria-label={t('label.go_to_page') + index}
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
