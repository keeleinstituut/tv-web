import { ReactElement, forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { Field, Label } from '@radix-ui/react-form'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { map } from 'lodash'
import { useClickAway } from 'ahooks'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'

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
    dropdownSize = 'l',
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    if (multiple) {
      setIsOpen(true)
    } else setIsOpen(!isOpen)
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
      setIsOpen(true)
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
        className={classNames(
          classes.wrapper,
          error && classes.errorMessage,
          classes[dropdownSize]
        )}
        onClick={toggleDropdown}
      >
        <BaseButton
          className={classNames(
            classes.toggleDropdown,
            disabled && classes.disabledDropdown,
            classes[dropdownSize]
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
          className={classNames(classes.dropdownMenu, classes[dropdownSize])}
          hidden={disabled || !isOpen || !!error}
        >
          <div hidden={!searchInput}>{searchInput}</div>

          {map(options, (option, index) => {
            const isSelected = value && value.includes(option?.value)

            return (
              <li
                key={index}
                className={classes.dropdownMenuItem}
                onClick={() => handleOptionSelect(option)}
              >
                {multiple ? (
                  <CheckBoxInput
                    hidden={!multiple}
                    name={name}
                    ariaLabel={ariaLabel}
                    label={option?.label}
                    value={isSelected || false}
                    className={classes.option}
                  />
                ) : (
                  <p
                    hidden={multiple}
                    className={classNames(
                      classes.option,
                      isSelected && classes.selectedOption
                    )}
                  >
                    {option?.label}
                  </p>
                )}
              </li>
            )
          })}
          <div
            hidden={!buttons}
            className={classNames(buttons && classes.buttonsContainer)}
          >
            <Button appearance={AppearanceTypes.Secondary}>
              {cancelButtonLabel}
            </Button>
            <Button appearance={AppearanceTypes.Primary}>
              {proceedButtonLabel}
            </Button>
          </div>
        </div>

        <p hidden={!helperText} className={classes.helperText}>
          {helperText}
        </p>

        <InputError {...error} />
      </div>
    </Field>
  )
})

export default SelectionControlsInput
