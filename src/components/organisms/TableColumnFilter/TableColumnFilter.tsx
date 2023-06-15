import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as FilterIcon } from 'assets/icons/filter.svg'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'
import classes from './styles.module.scss'
import { isArray } from 'lodash'

type FilterProps = {
  filterOption: DropDownOptions[]
  columnId: string
  onChange: (filters: string[], columnId: string) => void
  name: string
  hidden?: boolean
}

const TableColumnFilter = ({
  filterOption,
  columnId,
  onChange,
  name,
  hidden,
}: FilterProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }
  const handelOnChange = (value: string | string[]) => {
    const filters = isArray(value) ? value : [value]
    onChange(filters, columnId)
  }

  if (hidden) return null

  return (
    <div>
      <Button
        onClick={toggleDropdown}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        icon={FilterIcon}
        ariaLabel={t('label.filter')}
        className={classes.iconButton}
      />

      <DropdownContent
        name={name}
        ariaLabel={name}
        options={filterOption}
        multiple
        buttons
        cancelButtonLabel={t('button.cancel')}
        proceedButtonLabel={t('button.filter')}
        // searchInput: <Fragment />,
        onChange={handelOnChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={classes.dropDown}
      />
    </div>
  )
}

export default TableColumnFilter
