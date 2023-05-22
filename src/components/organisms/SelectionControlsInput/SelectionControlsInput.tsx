import { forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { Field, Label } from '@radix-ui/react-form'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import Icon from 'components/atoms/Icon/Icon'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as Dropdown } from 'assets/icons/dropdown.svg'
import { map } from 'lodash'
import { useClickAway } from 'ahooks'

import classes from './styles.module.scss'

export interface SelectionControlsInputProps {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  value?: boolean
  options: {
    label: string
    value: string
  }[]
  onChange: (value: string) => void
  disabled?: boolean
  defaultLabel?: string
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
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionSelect = (
    option: { label: string; value: string } | null
  ) => {
    onChange(option ? option?.value : '')
    setIsOpen(false)
  }

  const clickAwayInputRef = useRef(null)

  useClickAway(() => {
    setIsOpen(false)
  }, [clickAwayInputRef])

  return (
    <Field
      name={name}
      className={classNames(classes.selectionsContainer, className)}
      ref={clickAwayInputRef}
    >
      <Label
        className={classNames(classes.label, !label && classes.hiddenLabel)}
      >
        {label}
      </Label>
      <div
        className={classNames(classes.wrapper, error && classes.errorMessage)}
        onClick={toggleDropdown}
      >
        <BaseButton
          className={classNames(
            classes.toggleDropdown,
            disabled && classes.disabledDropdown
          )}
        >
          {value || defaultLabel}
          <Icon
            icon={Dropdown}
            className={classNames(
              disabled && classes.disabledDropdownIcon,
              isOpen && !error && classes.openDropdownIcon
            )}
            ariaLabel={ariaLabel}
          />
        </BaseButton>
        <ul
          className={classes.dropdownMenu}
          hidden={disabled || !isOpen || !!error}
        >
          {map(options, (option, index) => (
            <li
              key={index}
              className={classes.dropdownMenuItem}
              onClick={() => handleOptionSelect(option)}
            >
              {option?.label}
            </li>
          ))}
        </ul>
        <InputError {...error} />
      </div>
    </Field>
  )
})

export default SelectionControlsInput
