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
import TableFilter from 'components/organisms/TableFilter/TableFilter'

type HeaderGroupProps<TData> = {
  table: Table<TData>
  sortable?: boolean
  filterable?: boolean
}
type ColumnMeta = {
  meta: {
    size: number | string
  }
}
type CustomColumnDef<TData> = ColumnDef<TData> & ColumnMeta

interface HeaderItemProps<TData> extends HeaderGroupProps<TData> {
  hidden?: boolean
  header: Header<TData, RowData>
}
const HeaderItem = <TData extends object>({
  hidden,
  sortable,
  filterable,
  header,
  table,
}: HeaderItemProps<TData>) => {
  const { t } = useTranslation()

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
        />
      )}

      {flexRender(header.column.columnDef.header, header.getContext())}
      {/* TODO: make more api based filtering */}
      {filterable && header.column.getCanFilter() && (
        <TableFilter column={header.column} table={table} />
      )}
    </div>
  )
}

const TableHeaderGroup = <TData extends object>({
  table,
  sortable,
  filterable,
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
                  filterable={filterable}
                  table={table}
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
