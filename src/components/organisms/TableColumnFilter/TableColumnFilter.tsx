import { FC, SVGProps, useState } from 'react'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'
import classes from './styles.module.scss'

type FilterProps = {
  filterOption: DropDownOptions[]
  onChange: (value: string | string[]) => void
  name: string
  hidden?: boolean
  multiple?: boolean
  icon: FC<SVGProps<SVGSVGElement>>
  buttons?: boolean
  ariaLabel: string
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
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  if (hidden) return null

  return (
    <div>
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
        multiple={multiple}
        buttons={buttons}
        // searchInput: <Fragment />,
        onChange={onChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={classes.dropDown}
      />
    </div>
  )
}

export default TableColumnFilter
