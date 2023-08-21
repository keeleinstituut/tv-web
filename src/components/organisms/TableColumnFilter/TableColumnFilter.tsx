import { FC, SVGProps, useState } from 'react'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'
import classes from './classes.module.scss'

type FilterProps = {
  filterOption: DropDownOptions[]
  onChange: (value: string | string[]) => void
  name: string
  hidden?: boolean
  multiple?: boolean
  icon: FC<SVGProps<SVGSVGElement>>
  buttons?: boolean
  ariaLabel: string
  value?: string | string[]
  showSearch?: boolean
}

const TableColumnFilter = ({
  filterOption,
  onChange,
  name,
  hidden,
  multiple,
  icon,
  buttons,
  ariaLabel,
  value,
  showSearch,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  if (hidden) return null

  return (
    <div className={classes.container}>
      <Button
        onClick={toggleDropdown}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        icon={icon}
        ariaLabel={ariaLabel}
        className={classes.iconButton}
      />

      <DropdownContent
        name={name}
        ariaLabel={ariaLabel}
        options={filterOption}
        value={value}
        multiple={multiple}
        buttons={buttons}
        onChange={onChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={classes.dropDown}
        showSearch={showSearch}
      />
    </div>
  )
}

export default TableColumnFilter
