import { FC, ReactElement, SVGProps, forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { useClickAway } from 'ahooks'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'

import classes from './classes.module.scss'
import { filter, find, map } from 'lodash'

export enum DropdownSizeTypes {
  L = 'l',
  M = 'm',
  S = 's',
  XS = 'xs',
}
export type DropDownOptions = {
  label: string
  value: string
}
export interface SelectionControlsInputProps {
  name: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  value?: string | string[]
  options: DropDownOptions[]
  onChange: (value: string | string[]) => void
  disabled?: boolean
  placeholder?: string
  multiple?: boolean
  helperText?: string
  buttons?: boolean
  searchInput?: ReactElement
  dropdownSize?: DropdownSizeTypes
  tags?: boolean
  className?: string
  selectIcon?: FC<SVGProps<SVGSVGElement>>
  errorZIndex?: number
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
    searchInput,
    dropdownSize,
    errorZIndex,
    tags = false,
    className,
    selectIcon,
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

  const selectedOptionObjects = filter(options, (option) => {
    return !!find(value, (singleValue) => singleValue === option?.value)
  })

  const singleValue: DropDownOptions | undefined = find(options, {
    value,
  }) as unknown as DropDownOptions
  const multiValue = multiple
    ? filter(
        options,
        (option) =>
          !!find(value, (singleValue) => singleValue === option?.value)
      )
    : []
  const valueAsArray = multiple ? multiValue : [singleValue]

  const selectedOptionLabels = map(valueAsArray, (value) => value?.label)

  const singleSelectMenuLabel = value ? selectedOptionLabels : placeholder

  const dropdownMenuLabel = multiple ? placeholder : singleSelectMenuLabel

  const SelectInputArrow = selectIcon || DropdownArrow

  return (
    <InputWrapper
      label={label}
      name={name}
      error={error}
      className={classNames(classes.selectionsContainer, className)}
      wrapperClass={classes[dropdownSize || 'l']}
      onClick={toggleDropdown}
      ref={clickAwayInputRef}
      errorClass={classes.selectionsError}
      errorZIndex={errorZIndex}
    >
      <BaseButton
        className={classNames(
          classes.toggleDropdown,
          disabled && classes.disabledDropdown,
          error && classes.error,
          classes[dropdownSize || 'l']
        )}
        id={name}
        ref={ref}
      >
        <p hidden={!placeholder} className={classes.menuLabel}>
          {dropdownMenuLabel}
        </p>

        <SelectInputArrow
          className={classNames(
            disabled && classes.disabledDropdownIcon,
            isOpen && !error && classes.openDropdownIcon
          )}
        />
      </BaseButton>
      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>
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
        helperText={helperText}
        selectedOptionObjects={selectedOptionObjects}
        tags={tags}
        setIsOpen={setIsOpen}
        errorZIndex={errorZIndex}
      />
    </InputWrapper>
  )
})

export default SelectionControlsInput
