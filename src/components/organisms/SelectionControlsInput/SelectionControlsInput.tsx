import { forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { Field, Label } from '@radix-ui/react-form'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
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

  const handleSingleOptionSelect = (
    option: { label: string; value: string } | null
  ) => {
    onChange(option ? option?.value : '')
    setIsOpen(false)
  }

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

  const handleMultipleOptionSelect = (selectedValue: string) => {
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

  const handleOptionSelect = (selectedOption: {
    label: string
    value: string
  }) => {
    // const selectedValues = Array.isArray(value) ? [...value] : [] // Create a new array to hold the selected values

    // const optionIndex = selectedValues.indexOf(selectedOption.value)

    // if (optionIndex === -1) {
    //   // Option is not selected, add it to the selected values
    //   selectedValues.push(selectedOption.value)
    // } else {
    //   // Option is already selected, remove it from the selected values
    //   selectedValues.splice(optionIndex, 1)
    // }

    // onChange(selectedValues) // Pass the updated array of selected values
    // setIsOpen(false)

    if (multiple) {
      const selectedValues = Array.isArray(value) ? [...value] : [] // Create a new array to hold the selected values

      const optionIndex = selectedValues.indexOf(selectedOption.value)

      if (optionIndex === -1) {
        // Option is not selected, add it to the selected values
        selectedValues.push(selectedOption.value)
      } else {
        // Option is already selected, remove it from the selected values
        selectedValues.splice(optionIndex, 1)
      }

      onChange(selectedValues) // Pass the updated array of selected values
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
        {/* <BaseButton
          className={classNames(
            classes.toggleDropdown,
            disabled && classes.disabledDropdown
          )}
        >
          {value || defaultLabel}
          <DropdownArrow
            className={classNames(
              disabled && classes.disabledDropdownIcon,
              isOpen && !error && classes.openDropdownIcon
            )}
          />
        </BaseButton> */}

        <BaseButton
          className={classNames(
            classes.toggleDropdown,
            disabled && classes.disabledDropdown
          )}
        >
          {value && value.length > 0
            ? options
                .filter((option) => value.includes(option.value))
                .map((option) => option.label)
                .join(', ')
            : defaultLabel}
          <DropdownArrow
            className={classNames(
              disabled && classes.disabledDropdownIcon,
              isOpen && !error && classes.openDropdownIcon
            )}
          />
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
                  value &&
                    value?.includes(option.value) &&
                    classes.dropdownMenuItemSelected
                )}
                onClick={() => handleSingleOptionSelect(option)}
              >
                {option?.label}
              </li>
            )
          })}
        </ul> */}

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
                  value &&
                    value?.includes(option.value) &&
                    classes.dropdownMenuItemSelected
                )}
                onClick={() => handleSingleOptionSelect(option)}
              >
                {option?.label}
              </li>
            )
          })}
        </ul> */}

        {/* <select
          className={classes.dropdownMenu}
          // hidden={disabled || !isOpen || !!error}
          onChange={(event) => handleMultipleOptionSelect(event.target.value)}
        >
          {map(options, (option, index) => (
            <option
              key={index}
              value={option?.value}
              className={classes.option}
            >
              {option?.label}
            </option>
          ))}
        </select> */}

        {/* <select
          className={classes.dropdownMenu}
          hidden={disabled || !isOpen || !!error}
          value={value}
          onChange={(event) => handleMultipleOptionSelect(event.target.value)}
          multiple={multiple}
        >
          {map(options, (option, index) => (
            <option
              key={index}
              value={option?.value}
              className={classes.option}
            >
              {option?.label}
            </option>
          ))}
        </select> */}

        {map(options, (option, index) => {
          const isSelected = value && value.includes(option.value)

          return (
            <li
              key={index}
              className={classNames(
                classes.dropdownMenuItem,
                isSelected && classes.dropdownMenuItemSelected
              )}
              onClick={() => handleOptionSelect(option)}
            >
              {option.label}
            </li>
          )
        })}

        <InputError {...error} />
      </div>
    </Field>
  )
})

export default SelectionControlsInput
