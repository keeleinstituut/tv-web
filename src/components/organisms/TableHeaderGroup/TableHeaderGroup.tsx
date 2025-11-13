import {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isEmpty, size, toString } from 'lodash'
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
import DatePicker, { CalendarContainer } from 'react-datepicker'
import dayjs from 'dayjs'
import classNames from 'classnames'

type HeaderItemContextType<TData> = {
  header: Header<TData, RowData>
} & HeaderGroupFunctions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeaderItemContext = createContext<HeaderItemContextType<any>>(null as any)

export interface HeaderGroupFunctions {
  onSortingChange?: (value?: SortingFunctionType) => void
  onFiltersChange?: (filters?: FilterFunctionType) => void
}

type HeaderGroupProps<TData> = {
  table: Table<TData>
} & HeaderGroupFunctions

type ColumnMeta = {
  meta?: {
    sortingOption?: SortingFunctionType['sort_order'][]
    currentSorting?: SortingFunctionType['sort_order']
    sortingParameterName: string

    FilteringComponent: ReactElement | (() => ReactElement)
  }
}
type CustomColumnDef<TData> = ColumnDef<TData> & ColumnMeta

type HeaderItemProps<TData> = {
  hidden?: boolean
  header: Header<TData, RowData>
} & HeaderGroupFunctions

interface DropdownFilterProps {
  filterKey: string
  options: DropDownOptions[]
  value?: string | string[]
  onEndReached?: () => void
  onSearch?: (value: string) => void
  isCustomSingleDropdown?: boolean
  showSearch?: boolean
}

export const TableSelectFilter = <TData,>({
  filterKey,
  options,
  value: currentValue,
  onEndReached,
  onSearch,
  isCustomSingleDropdown,
  showSearch,
}: DropdownFilterProps) => {
  const { t } = useTranslation()
  const { onFiltersChange, header } =
    useContext<HeaderItemContextType<TData>>(HeaderItemContext)
  const { id } = header

  const handleOnFiltering = (value: string | string[]) => {
    if (onFiltersChange) {
      onFiltersChange({ [filterKey]: value })
    }
  }

  return (
    <>
      <TableColumnFilter
        hidden={isEmpty(options) && !showSearch}
        filterOption={options}
        name={toString(id)}
        onChange={handleOnFiltering}
        icon={FilterIcon}
        value={currentValue}
        isCustomSingleDropdown={isCustomSingleDropdown}
        buttons
        ariaLabel={t('button.filter')}
        onEndReached={onEndReached}
        onSearch={onSearch}
        showSearch={showSearch}
      />
    </>
  )
}

type TableDateFilterProps = {
  filterKey: string
  value?: string
}

export const TableDateFilter = <TData,>({
  filterKey,
  value,
}: TableDateFilterProps) => {
  const { t } = useTranslation()
  const { onFiltersChange } =
    useContext<HeaderItemContextType<TData>>(HeaderItemContext)

  const clearSelection = useCallback(() => {
    if (onFiltersChange) {
      onFiltersChange({ [filterKey]: '' })
    }
  }, [onFiltersChange, filterKey])

  return (
    <>
      <DatePicker
        selected={value ? dayjs(value).toDate() : null}
        onChange={(value) => {
          if (onFiltersChange) {
            const formatted = dayjs(value).format('YYYY-MM-DD')
            onFiltersChange({ [filterKey]: formatted })
          }
        }}
        autoComplete="off"
        customInput={
          <Button
            appearance={AppearanceTypes.Text}
            size={SizeTypes.S}
            icon={FilterIcon}
            ariaLabel={t('button.sort')}
            className={classes.iconButton}
          />
        }
        calendarContainer={({ children, className }) => (
          <div className={classes.customCalendarContainer}>
            <CalendarContainer
              className={classNames(className, classes.calendar)}
            >
              {children}
            </CalendarContainer>
            <div className={classes.buttonsContainer}>
              <Button
                appearance={AppearanceTypes.Secondary}
                size={SizeTypes.S}
                onClick={clearSelection}
              >
                {t('button.clear_filter')}
              </Button>
            </div>
          </div>
        )}
      />
    </>
  )
}

const HeaderItem = <TData,>({
  hidden,
  header,
  onSortingChange,
  onFiltersChange,
}: HeaderItemProps<TData>) => {
  const { t } = useTranslation()

  const { id, column } = header || {}
  const { meta } = column.columnDef as CustomColumnDef<TData>

  const [currentSorting, setCurrentSorting] = useState<
    SortingFunctionType['sort_order']
  >(meta?.currentSorting || undefined)

  useEffect(() => {
    setCurrentSorting(meta?.currentSorting)
  }, [meta?.currentSorting])

  const sortingOption = meta?.sortingOption || []
  const sortingParameterName = meta?.sortingParameterName || id
  const FilteringComponent = meta?.FilteringComponent

  const [step, setStep] = useState<number>(
    currentSorting ? sortingOption.indexOf(currentSorting) + 1 : 0
  )

  const handleOnSorting = () => {
    const newStep = size(sortingOption) > step ? step + 1 : 0
    setStep(newStep)
    setCurrentSorting(sortingOption[step])

    if (onSortingChange) {
      const sortingValues = {
        sort_by: sortingParameterName,
        sort_order: sortingOption[step],
      }
      onSortingChange(sortingValues)
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

      <HeaderItemContext.Provider
        value={{
          header,
          onFiltersChange,
        }}
      >
        {}
        {typeof FilteringComponent === 'function' ? (
          <FilteringComponent />
        ) : (
          FilteringComponent
        )}
      </HeaderItemContext.Provider>
    </div>
  )
}

const TableHeaderGroup = <TData,>({
  table,
  onSortingChange,
  onFiltersChange,
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
