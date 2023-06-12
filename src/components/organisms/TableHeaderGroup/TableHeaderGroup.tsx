import classes from './styles.module.scss'
import {
  Table,
  ColumnDef,
  flexRender,
  Header,
  RowData,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as SortingArrows } from 'assets/icons/sorting_arrows.svg'
import { useCallback } from 'react'

type HeaderGroupProps<TData> = {
  table: Table<TData>
  sortable?: boolean
}
type ColumnMeta = {
  meta: {
    size: number | string
  }
}
type CustomColumnDef<TData> = ColumnDef<TData> & ColumnMeta

interface HeaderItemProps<TData> {
  hidden?: boolean
  header: Header<TData, RowData>
  sortable?: boolean
}

const HeaderItem = <TData extends object>({
  hidden,
  sortable,
  header,
}: HeaderItemProps<TData>) => {
  const { t } = useTranslation()

  const handleOnSorting = useCallback(() => {
    //TODO add serve side sorting
  }, [])

  if (hidden) return null

  return (
    <div className={classes.headingWrapper}>
      {sortable && header.column.getCanSort() && (
        <Button
          onClick={header.column.getToggleSortingHandler()}
          appearance={AppearanceTypes.Text}
          size={SizeTypes.S}
          icon={SortingArrows}
          ariaLabel={t('label.button_arrow')}
          iconPositioning={IconPositioningTypes.Left}
          className={classes.sortingButton}
        />
      )}

      {flexRender(header.column.columnDef.header, header.getContext())}
    </div>
  )
}

const TableHeaderGroup = <TData extends object>({
  table,
  sortable,
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
                  sortable={sortable}
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
