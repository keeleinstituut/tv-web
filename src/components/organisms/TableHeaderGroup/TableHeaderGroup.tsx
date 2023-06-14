import { useCallback, useState } from 'react'
import { isEmpty, toString, size } from 'lodash'
import { useTranslation } from 'react-i18next'
import {
  Table,
  ColumnDef,
  flexRender,
  Header,
  RowData,
} from '@tanstack/react-table'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as SortingArrows } from 'assets/icons/sorting_arrows.svg'
import TableColumnFilter from 'components/organisms/TableColumnFilter/TableColumnFilter'
import classes from './styles.module.scss'
interface HeaderGroupFunctions {
  onSortingChange?: (value: string | boolean, columnId: string) => void
  onColumnFiltersChange?: (filters: string[], columnId: string) => void
}
type HeaderGroupProps<TData> = {
  table: Table<TData>
} & HeaderGroupFunctions

type ColumnMeta = {
  meta?: {
    size?: number | string
    filterOption?: DropDownOptions[]
    sortingOption?: (string | boolean)[]
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const { id, column } = header || {}
  const { meta } = column.columnDef as CustomColumnDef<TData>
  const filterOption = meta?.filterOption || []
  const sortingOption = meta?.sortingOption || []
  const value = sortingOption[currentIndex]
  const newIndex = size(sortingOption) - 1 > currentIndex ? currentIndex + 1 : 0

  const handleOnSorting = useCallback(() => {
    if (onSortingChange) {
      onSortingChange(value, id)
      setCurrentIndex(newIndex)
    }
  }, [id, newIndex, onSortingChange, value])

  if (hidden) return null

  return (
    <div className={classes.headingWrapper}>
      {!isEmpty(sortingOption) && (
        <Button
          onClick={handleOnSorting}
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          icon={SortingArrows}
          ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Left}
          className={classes.sortingButton}
        />
      )}

      {flexRender(column.columnDef.header, header.getContext())}

      {!isEmpty(filterOption) && onColumnFiltersChange ? (
        <TableColumnFilter
          filterOption={filterOption}
          columnId={toString(id)}
          name={'Status'}
          onChange={onColumnFiltersChange}
        />
      ) : null}
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
