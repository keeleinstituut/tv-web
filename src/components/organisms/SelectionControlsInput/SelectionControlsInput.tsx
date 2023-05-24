import { forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { Field, Label } from '@radix-ui/react-form'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { map } from 'lodash'
import { useClickAway } from 'ahooks'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'

import classes from './styles.module.scss'

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

  const handleOptionSelect = (selectedOption: {
    label: string
    value: string
  }) => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? [...value] : []
      const optionIndex = selectedValues.indexOf(selectedOption?.value)

      if (optionIndex === -1) {
        selectedValues.push(selectedOption.value)
      } else {
        selectedValues.splice(optionIndex, 1)
      }
      onChange(selectedValues)
      setIsOpen(false)
    } else {
      onChange(selectedOption ? selectedOption?.value : '')
      setIsOpen(false)
    }
  }

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
        className={classNames(classes.wrapper, error && classes.errorMessage)}
        onClick={toggleDropdown}
      >
        <BaseButton
          className={classNames(
            classes.toggleDropdown,
            disabled && classes.disabledDropdown
          )}
        >
          {value && value.length > 0
            ? options
                .filter((option) => value.includes(option?.value))
                .map((option) => option?.label)
                .join(', ')
            : defaultLabel}
          <DropdownArrow
            className={classNames(
              disabled && classes.disabledDropdownIcon,
              isOpen && !error && classes.openDropdownIcon
            )}
          />
        </BaseButton>

        <div
          className={classes.dropdownMenu}
          hidden={disabled || !isOpen || !!error}
        >
          {map(options, (option, index) => {
            const isSelected = value && value.includes(option?.value)

            return (
              <li
                key={index}
                className={classNames(classes.dropdownMenuItem)}
                onClick={() => handleOptionSelect(option)}
              >
                {multiple ? (
                  <CheckBoxInput
                    name={name}
                    ariaLabel={ariaLabel}
                    label={option?.label}
                    value={isSelected || false}
                    className={classes.option}
                  />
                ) : (
                  <p className={classes.option}>{option?.label}</p>
                )}
              </li>
            )
          })}
        </div>

        <InputError {...error} />
      </div>
    </Field>
  )
})

export default SelectionControlsInput
