import { ReactElement, forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { useClickAway } from 'ahooks'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'

import classes from './styles.module.scss'
import { filter, includes, map } from 'lodash'

export enum DropdownSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
}

export interface SelectionControlsInputProps {
  name: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  value?: string
  options: {
    label: string
    value: string
  }[]
  onChange: (value: string | string[]) => void
  disabled?: boolean
  placeholder?: string
  multiple?: boolean
  helperText?: string
  buttons?: boolean
  cancelButtonLabel?: string
  proceedButtonLabel?: string
  searchInput?: ReactElement
  dropdownSize?: DropdownSizeTypes
  tags?: boolean
}

const SelectionControlsInput = forwardRef<
  HTMLButtonElement,
  SelectionControlsInputProps
>(function SelectionControlsInput(
  {
    label,
    name,
    ariaLabel,
    value,
    error,
    options,
    onChange,
    disabled,
    placeholder,
    multiple = false,
    helperText,
    buttons = false,
    cancelButtonLabel,
    proceedButtonLabel,
    searchInput,
    dropdownSize,
    tags = false,
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const clickAwayInputRef = useRef(null)

  useClickAway(() => {
    setIsOpen(false)
  }, [clickAwayInputRef])

  const selectedOptionObjects = filter(options, (option) =>
    includes(value, option?.value)
  )

  const selectedOptionLabels = map(selectedOptionObjects, ({ label }) => label)

  const singleSelectMenuLabel = value ? selectedOptionLabels : placeholder

  const dropdownMenuLabel = multiple ? placeholder : singleSelectMenuLabel

  return (
    <InputWrapper
      label={label}
      name={name}
      error={error}
      className={classes.selectionsContainer}
      wrapperClass={classes[dropdownSize || 'l']}
      onClick={toggleDropdown}
      ref={clickAwayInputRef}
      selectionsError={classes.selectionsError}
    >
      <BaseButton
        className={classNames(
          classes.toggleDropdown,
          disabled && classes.disabledDropdown,
          classes[dropdownSize || 'l']
        )}
        id={name}
        ref={ref}
      >
        <p hidden={!placeholder} className={classes.menuLabel}>
          {dropdownMenuLabel}
        </p>
        <DropdownArrow
          className={classNames(
            disabled && classes.disabledDropdownIcon,
            isOpen && !error && classes.openDropdownIcon
          )}
        />
      </BaseButton>

      <DropdownContent
        name={name}
        ariaLabel={ariaLabel}
        options={options}
        onChange={onChange}
        dropdownSize={dropdownSize}
        disabled={disabled}
        isOpen={isOpen}
        searchInput={searchInput}
        multiple={multiple}
        value={value}
        buttons={buttons}
        cancelButtonLabel={cancelButtonLabel}
        proceedButtonLabel={proceedButtonLabel}
        helperText={helperText}
        selectedOptionObjects={selectedOptionObjects}
        tags={tags}
        setIsOpen={setIsOpen}
      />
    </InputWrapper>
  )
})

export default SelectionControlsInput
