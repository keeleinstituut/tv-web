import {
  CSSProperties,
  ReactElement,
  Ref,
  createContext,
  forwardRef,
  useEffect,
  useId,
  useState,
} from 'react'
import classes from './classes.module.scss'
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
} from '@tanstack/react-table'
import Container from 'components/atoms/Container/Container'
import TablePagination from 'components/organisms/TablePagination/TablePagination'
import TableHeaderGroup, {
  HeaderGroupFunctions,
} from 'components/organisms/TableHeaderGroup/TableHeaderGroup'
import { ResponseMetaTypes, PaginationFunctionType } from 'types/collective'

export enum TableSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
}

interface TableContextType {
  horizontalWrapperId?: string
  tableRef?: Ref<HTMLDivElement> | null
}

export const TableContext = createContext<TableContextType>({
  horizontalWrapperId: undefined,
  tableRef: null,
})

type DataTableProps<TData extends RowData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  tableSize: TableSizeTypes
  title?: string
  headComponent?: ReactElement
  paginationData?: ResponseMetaTypes
  onPaginationChange?: (value?: PaginationFunctionType) => void
  meta?: TableMeta<TData>
  className?: string
  subRows?: Row<TData>[] | undefined
  pageSizeOptions?: { label: string; value: string }[]
  tableWrapperClassName?: string
  hidden?: boolean
  getSubRows?:
    | ((originalRow: TData, index: number) => TData[] | undefined)
    | undefined
  hidePagination?: boolean
  hidePaginationSelectionInput?: boolean
  columnOrder?: string[] | undefined
} & HeaderGroupFunctions

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties
  }
}

const DataTable = <TData,>(
  {
    data,
    columns,
    tableSize = TableSizeTypes.M,
    title,
    onSortingChange,
    onFiltersChange,
    paginationData,
    onPaginationChange,
    meta,
    getSubRows,
    className,
    pageSizeOptions,
    hidePagination = false,
    headComponent,
    hidePaginationSelectionInput = false,
    tableWrapperClassName,
    hidden,
    columnOrder,
  }: DataTableProps<TData>,
  ref: Ref<HTMLDivElement>
) => {
  const [horizontalWrapperId] = useState(useId())
  const { per_page, last_page } = paginationData || {}
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: per_page || 10,
  })

  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange({
        per_page: pagination.pageSize,
        page: pagination.pageIndex + 1,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination])

  const table = useReactTable<TData>({
    data,
    columns,
    manualPagination: !!paginationData, // Tell react-table that you will handle the pagination manually
    pageCount: last_page, // Provide the total number of pages
    state: {
      expanded,
      columnOrder,
      ...{ pagination },
    },
    meta,
    ...(!paginationData && { getPaginationRowModel: getPaginationRowModel() }), // If only doing manual pagination, you don't need this
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onExpandedChange: setExpanded,
    getSubRows: getSubRows,
    getExpandedRowModel: getExpandedRowModel(),
  })
  if (hidden) {
    return null
  }
  return (
    <TableContext.Provider
      value={{
        horizontalWrapperId,
        tableRef: ref,
      }}
    >
      <Container ref={ref} className={className}>
        <h4 className={classes.title} hidden={!title}>
          {title}
        </h4>
        {headComponent}
        <div
          className={classNames(classes.tableWrapper, tableWrapperClassName)}
          id={horizontalWrapperId}
        >
          <table className={classNames(classes.dataTable, classes[tableSize])}>
            <TableHeaderGroup
              table={table}
              onSortingChange={onSortingChange}
              onFiltersChange={onFiltersChange}
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
        </div>
        <TablePagination
          hidden={hidePagination}
          table={table}
          pageSizeOptions={pageSizeOptions}
          hidePaginationSelectionInput={hidePaginationSelectionInput}
        />
      </Container>
    </TableContext.Provider>
  )
}

const DataTableWithRef = forwardRef(DataTable) as <TData>(
  props: DataTableProps<TData> & { ref?: Ref<HTMLDivElement> }
) => ReactElement

export default DataTableWithRef
