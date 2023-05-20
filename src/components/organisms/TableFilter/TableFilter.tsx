import React, { FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { Column, Table } from '@tanstack/react-table'

import { ReactComponent as FilterIcon } from 'assets/icons/filter.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

export type FilterProps = {
  column: Column<any, unknown>
  table: Table<any>
}

const TableFilter: FC<FilterProps> = ({ column, table }) => {
  const { t } = useTranslation()

  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = useMemo(
    () => Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column]
  )

  return (
    <>
      {/* ToDO add Popup component */}
      <datalist id={column.id + 'list'}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>

      <Button
        // onClick={(value) => column.setFilterValue(value)}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        icon={FilterIcon}
        ariaLabel={t('label.filter')}
        iconPositioning={IconPositioningTypes.Right}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
      />
    </>
  )
}

export default TableFilter
