import { useState } from 'react'
import { isEmpty, toString } from 'lodash'
import { useTranslation } from 'react-i18next'
import {
  Table,
  ColumnDef,
  flexRender,
  Header,
  RowData,
} from '@tanstack/react-table'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { ReactComponent as FilterIcon } from 'assets/icons/filter.svg'
import { ReactComponent as SortingMore } from 'assets/icons/sorting_arrows.svg'
import { ReactComponent as SortingLess } from 'assets/icons/sorting_less.svg'
import TableColumnFilter from 'components/organisms/TableColumnFilter/TableColumnFilter'
import classes from './styles.module.scss'

export interface HeaderGroupFunctions {
  onSortingChange?: (filters: string | string[], columnId: string) => void
  onColumnFiltersChange?: (filters: string | string[], columnId: string) => void
}

type HeaderGroupProps<TData> = {
  table: Table<TData>
} & HeaderGroupFunctions

type ColumnMeta = {
  meta?: {
    size?: number | string
    filterOption?: DropDownOptions[]
    sortingOption?: DropDownOptions[]
  }
}
type CustomColumnDef<TData> = ColumnDef<TData> & ColumnMeta

type HeaderItemProps<TData> = {
  hidden?: boolean
  header: Header<TData, RowData>
} & HeaderGroupFunctions

const HeaderItem = <TData extends object>({
  hidden,
  header,
  onSortingChange,
  onColumnFiltersChange,
}: HeaderItemProps<TData>) => {
  const { t } = useTranslation()
  const [currentSorting, setCurrentSorting] = useState<string>()
  const { id, column } = header || {}
  const { meta } = column.columnDef as CustomColumnDef<TData>
  const filterOption = meta?.filterOption || []
  const sortingOption = meta?.sortingOption || []

  const handleOnSorting = (value: string | string[]) => {
    if (onSortingChange) {
      onSortingChange(value, toString(id))
      setCurrentSorting(toString(value))
    }
  }

  const handleOnFiltering = (value: string | string[]) => {
    if (onColumnFiltersChange) {
      onColumnFiltersChange(value, toString(id))
    }
  }

  if (hidden) return null

  return (
    <div className={classes.headingWrapper}>
      <TableColumnFilter
        hidden={isEmpty(sortingOption)}
        filterOption={sortingOption}
        name={toString(id)}
        onChange={handleOnSorting}
        icon={currentSorting === 'asc' ? SortingLess : SortingMore}
        ariaLabel={t('button.sort')}
      />

      {flexRender(column.columnDef.header, header.getContext())}

      <TableColumnFilter
        hidden={isEmpty(filterOption)}
        filterOption={filterOption}
        name={toString(id)}
        onChange={handleOnFiltering}
        icon={FilterIcon}
        multiple
        buttons
        ariaLabel={t('button.filter')}
      />
    </div>
  )
}

const TableHeaderGroup = <TData extends object>({
  table,
  onSortingChange,
  onColumnFiltersChange,
}: HeaderGroupProps<TData>) => {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            return (
              <th
                key={header.id}
                style={{
                  width: (header.column.columnDef as CustomColumnDef<TData>)
                    .meta?.size,
                }}
              >
                <HeaderItem
                  hidden={header.isPlaceholder}
                  header={header}
                  onSortingChange={onSortingChange}
                  onColumnFiltersChange={onColumnFiltersChange}
                />
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}

export default TableHeaderGroup
