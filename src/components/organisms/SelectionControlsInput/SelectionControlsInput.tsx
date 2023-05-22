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
  value?: string
  options: {
    label: string
    value: string
  }[]
  // onChange: (value: string) => void
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

  // const handleOptionSelect = (
  //   option: { label: string; value: string } | null
  // ) => {
  //   onChange(option ? option?.value : '')
  //   setIsOpen(false)
  // }

  // const handleOptionSelect = (
  //   option: { label: string; value: string } | null
  // ) => {
  //   if (multiple) {
  //     const selectedValues = option ? [option.value] : []
  //     onChange(selectedValues)
  //   } else {
  //     onChange(option ? option.value : '')
  //   }
  //   setIsOpen(false)
  // }

  // const handleOptionSelect = (selectedValue: string) => {
  //   const selectedOption = options.find(
  //     (option) => option?.value === selectedValue
  //   )

  //   if (multiple) {
  //     const selectedValues = selectedOption ? [selectedOption?.value] : []
  //     onChange(selectedValues)
  //   } else {
  //     onChange(selectedOption ? selectedOption?.value : '')
  //   }
  //   setIsOpen(false)
  // }

  const handleOptionSelect = (selectedValue: string) => {
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    )
    let updatedSelectedOptions: string[] = []

    if (multiple) {
      if (value && Array.isArray(value)) {
        // Clone the existing array of selected options
        updatedSelectedOptions = [...value]

        if (selectedOption) {
          // Check if the selected option is already in the array
          const index = updatedSelectedOptions.indexOf(selectedOption.value)
          if (index === -1) {
            // Add the selected option to the array
            updatedSelectedOptions.push(selectedOption.value)
          } else {
            // Remove the selected option from the array
            updatedSelectedOptions.splice(index, 1)
          }
        }
      } else {
        if (selectedOption) {
          // Create a new array with the selected option
          updatedSelectedOptions = [selectedOption.value]
        }
      }
    } else {
      updatedSelectedOptions = selectedOption ? [selectedOption.value] : []
    }

    onChange(updatedSelectedOptions)
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
      // ref={clickAwayInputRef}
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
          {/* <Icon
            icon={Dropdown}
            className={classNames(
              disabled && classes.disabledDropdownIcon,
              isOpen && !error && classes.openDropdownIcon
            )}
            ariaLabel={ariaLabel}
          /> */}
        </BaseButton>
        {/* <ul
          className={classes.dropdownMenu}
          hidden={disabled || !isOpen || !!error}
        >
          {map(options, (option, index) => {
            return (
              <li
                key={index}
                className={classNames(
                  classes.dropdownMenuItem,
                  multiple &&
                    value?.includes(option.value) &&
                    classes.dropdownMenuItemSelected
                )}
                onClick={() => handleOptionSelect(option)}
              >
                {option?.label}
              </li>
            )
          })}
        </ul> */}
        <select
          value={value}
          onChange={(event) => handleOptionSelect(event.target.value)}
          multiple={multiple}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <InputError {...error} />
      </div>
    </Field>
  )
})

export default SelectionControlsInput
