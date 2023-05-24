import { ReactElement, forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { Field, Label } from '@radix-ui/react-form'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { useClickAway } from 'ahooks'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'

import classes from './styles.module.scss'

export enum DropdownSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
}

export interface SelectionControlsInputProps {
  name: string
  className?: string
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
  defaultLabel?: string
  multiple?: boolean
  helperText?: string
  buttons?: boolean
  cancelButtonLabel?: string
  proceedButtonLabel?: string
  searchInput?: ReactElement
  dropdownSize?: DropdownSizeTypes
}

const SelectionControlsInput = forwardRef<
  HTMLInputElement,
  SelectionControlsInputProps
>(function SelectionControlsInput(
  {
    label,
    name,
    ariaLabel,
    className,
    value,
    error,
    options,
    onChange,
    disabled,
    defaultLabel,
    multiple = false,
    helperText,
    buttons = false,
    cancelButtonLabel,
    proceedButtonLabel,
    searchInput,
    dropdownSize,
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

  const joinedSelectedOptionLabels = options
    .filter((option) => value?.includes(option?.value))
    .map(({ label }) => label)
    .join(', ')

  const dropdownMenuLabel = value ? joinedSelectedOptionLabels : defaultLabel

  return (
    <Field
      name={name}
      className={classNames(classes.selectionsContainer, className)}
      ref={clickAwayInputRef}
    >
      <Label
        htmlFor={name}
        className={classNames(classes.label, !label && classes.hiddenLabel)}
      >
        {label}
      </Label>
      <div
        className={classNames(
          classes.wrapper,
          error && classes.errorMessage,
          classes[dropdownSize || 'l']
        )}
        onClick={toggleDropdown}
      >
        <BaseButton
          className={classNames(
            classes.toggleDropdown,
            disabled && classes.disabledDropdown,
            classes[dropdownSize || 'l']
          )}
        >
          <p>{dropdownMenuLabel}</p>
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
          error={error}
          searchInput={searchInput}
          multiple={multiple}
          value={value}
          buttons={buttons}
          cancelButtonLabel={cancelButtonLabel}
          proceedButtonLabel={proceedButtonLabel}
        />

        <p hidden={!helperText} className={classes.helperText}>
          {helperText}
        </p>

        <InputError {...error} />
      </div>
    </Field>
  )
})

export default SelectionControlsInput
