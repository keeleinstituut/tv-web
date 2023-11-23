import { useMemo, useState } from 'react'
import { isEmpty, keys, size, toString, values } from 'lodash'
import { useTranslation } from 'react-i18next'
import {
  Table,
  ColumnDef,
  flexRender,
  Header,
  RowData,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { ReactComponent as FilterIcon } from 'assets/icons/filter.svg'
import { ReactComponent as SortingArrows } from 'assets/icons/sorting_arrows.svg'
import { ReactComponent as SortingMore } from 'assets/icons/sorting_more.svg'
import { ReactComponent as SortingLess } from 'assets/icons/sorting_less.svg'
import TableColumnFilter from 'components/organisms/TableColumnFilter/TableColumnFilter'
import classes from './classes.module.scss'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { FilterFunctionType, SortingFunctionType } from 'types/collective'

export interface HeaderGroupFunctions {
  onSortingChange?: (value?: SortingFunctionType) => void
  onFiltersChange?: (filters?: FilterFunctionType) => void
  setPagination: OnChangeFn<PaginationState>
}

type HeaderGroupProps<TData> = {
  table: Table<TData>
  per_page?: number
} & HeaderGroupFunctions

type FilterTypes = {
  [filterKey: string]: DropDownOptions[]
}

type ColumnMeta = {
  meta?: {
    filterOption?: FilterTypes
    sortingOption?: SortingFunctionType['sort_order'][]
    filterValue?: string | string[]
    onEndReached?: () => void
    onSearch?: (value: string) => void
    showSearch?: boolean
  }
}
type CustomColumnDef<TData> = ColumnDef<TData> & ColumnMeta

type HeaderItemProps<TData> = {
  hidden?: boolean
  header: Header<TData, RowData>
  per_page?: number
} & HeaderGroupFunctions

const HeaderItem = <TData,>({
  hidden,
  header,
  onSortingChange,
  onFiltersChange,
  setPagination,
  per_page,
}: HeaderItemProps<TData>) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<number>(0)
  const [currentSorting, setCurrentSorting] =
    useState<SortingFunctionType['sort_order']>(undefined)

  const { id, column } = header || {}
  const { meta } = column.columnDef as CustomColumnDef<TData>
  const filterOption = meta?.filterOption || []
  const onEndReached = meta?.onEndReached
  const onSearch = meta?.onSearch
  const showSearch = meta?.showSearch

  const options = values(filterOption)[0] || []
  const sortingOption = meta?.sortingOption || []
  const filterValue = meta?.filterValue

  const handleOnSorting = () => {
    const newStep = size(sortingOption) > step ? step + 1 : 0
    setStep(newStep)
    setCurrentSorting(sortingOption[step])

    if (onSortingChange) {
      const sortingValues = {
        sort_by: id,
        sort_order: sortingOption[step],
      }
      onSortingChange(sortingValues)
      setPagination({
        pageIndex: 0,
        pageSize: per_page || 10,
      })
    }
  }
  const Icon = useMemo(() => {
    switch (currentSorting) {
      case 'asc': {
        return SortingLess
      }
      case 'desc': {
        return SortingMore
      }
      default: {
        return SortingArrows
      }
    }
  }, [currentSorting])

  const handleOnFiltering = (value: string | string[]) => {
    const filterKey = keys(filterOption)[0]

    if (onFiltersChange) {
      onFiltersChange({ [filterKey]: value })
      setPagination({
        pageIndex: 0,
        pageSize: per_page || 10,
      })
    }
  }

  if (hidden) return null

  return (
    <div className={classes.headingWrapper}>
      <Button
        hidden={isEmpty(sortingOption)}
        onClick={handleOnSorting}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        icon={Icon}
        ariaLabel={t('button.sort')}
        className={classes.iconButton}
      />

      {flexRender(column.columnDef.header, header.getContext())}

      <TableColumnFilter
        hidden={isEmpty(options) && !showSearch}
        filterOption={options}
        name={toString(id)}
        onChange={handleOnFiltering}
        icon={FilterIcon}
        value={filterValue}
        multiple
        buttons
        ariaLabel={t('button.filter')}
        onEndReached={onEndReached}
        onSearch={onSearch}
        showSearch={showSearch}
      />
    </div>
  )
}

const TableHeaderGroup = <TData,>({
  table,
  onSortingChange,
  onFiltersChange,
  setPagination,
  per_page,
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
                  width:
                    header.getSize() !== 150 ? header.getSize() : undefined,
                }}
              >
                <HeaderItem
                  hidden={header.isPlaceholder}
                  header={header}
                  onSortingChange={onSortingChange}
                  onFiltersChange={onFiltersChange}
                  setPagination={setPagination}
                  per_page={per_page}
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
