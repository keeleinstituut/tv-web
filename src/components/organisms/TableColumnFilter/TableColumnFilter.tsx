import {
  FC,
  SVGProps,
  useState,
  useRef,
  useEffect,
  MouseEvent,
  useCallback,
} from 'react'
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
  onEndReached?: () => void
  onSearch?: (value: string) => void
  showSearch?: boolean
  isCustomSingleDropdown?: boolean
}

const TableColumnFilter = ({
  filterOption,
  onChange,
  name,
  hidden,
  icon,
  buttons,
  ariaLabel,
  value,
  onEndReached,
  onSearch,
  showSearch,
  isCustomSingleDropdown,
}: FilterProps) => {
  const dropdownRef = useRef(null)
  const wrapperRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [focusElement, setFocusElement] = useState<HTMLElement | null>(null)

  const toggleDropdown = (event: MouseEvent | KeyboardEvent) => {
    setIsOpen(!isOpen)
    if (!document.querySelector('.filter-focus') && !isOpen) {
      const target = event?.target as HTMLElement
      target.classList.add('filter-focus')
      setFocusElement(target)
    }
  }
  const escFunction = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (document.querySelector('.filter-focus') && !isOpen) {
      focusElement?.classList.remove('filter-focus')
      focusElement?.focus()
    }
  }, [focusElement, isOpen])

  useEffect(() => {
    document.addEventListener('keydown', escFunction)
    return () => {
      document.removeEventListener('keydown', escFunction)
    }
  }, [escFunction])

  if (hidden) return null

  return (
    <div className={classes.container} ref={wrapperRef}>
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
        multiple={!isCustomSingleDropdown}
        buttons={buttons}
        onChange={onChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={classes.dropDown}
        showSearch={showSearch}
        wrapperRef={wrapperRef}
        clickAwayInputRef={dropdownRef}
        onEndReached={onEndReached}
        onSearch={onSearch}
        usePortal
        isCustomSingleDropdown={isCustomSingleDropdown}
      />
    </div>
  )
}

export default TableColumnFilter
