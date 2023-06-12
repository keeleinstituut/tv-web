import { map } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Column } from '@tanstack/react-table'

import { ReactComponent as FilterIcon } from 'assets/icons/filter.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

type FilterProps<Person> = {
  filterOption: string[]
  column: Column<Person, string>
}

const TableColumnFilter = <TData extends object>({
  filterOption,
  column,
}: FilterProps<TData>) => {
  const { t } = useTranslation()

  return (
    <>
      {/* ToDO add Popup component */}
      <datalist id={column.id + 'list'}>
        {map(filterOption, (value: string) => (
          <option value={value} key={value} />
        ))}
      </datalist>

      <Button
        onClick={(value) => column.setFilterValue(value)}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        icon={FilterIcon}
        ariaLabel={t('label.filter')}
        iconPositioning={IconPositioningTypes.Right}
      />
    </>
  )
}

export default TableColumnFilter
