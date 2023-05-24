import { FC } from 'react'
import classNames from 'classnames'
import { map } from 'lodash'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { SelectionControlsInputProps } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

import classes from './styles.module.scss'

type DropdownContentProps = SelectionControlsInputProps & {
  isOpen?: boolean
}

type SingleOptionDropDownProps = {
  multiple?: boolean
  isSelected?: boolean
  optionLabel?: string
}

const SingleOptionDropDown: FC<SingleOptionDropDownProps> = ({
  multiple,
  isSelected,
  optionLabel,
}) => {
  if (multiple) return null
  return (
    <p
      className={classNames(
        classes.option,
        isSelected && classes.selectedOption
      )}
    >
      {optionLabel}
    </p>
  )
}

const DropdownContent: FC<DropdownContentProps> = ({
  dropdownSize = 'l',
  disabled,
  isOpen,
  error,
  searchInput,
  options,
  multiple = false,
  value,
  name,
  ariaLabel,
  buttons = false,
  cancelButtonLabel,
  proceedButtonLabel,
  onChange,
}) => {
  const handleOptionSelect = (selectedOption: {
    label: string
    value: string
  }) => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? [...value] : []
      const optionIndex = selectedValues?.indexOf(selectedOption?.value)

      if (optionIndex === -1) {
        selectedValues.push(selectedOption.value)
      } else {
        selectedValues.splice(optionIndex, 1)
      }
      onChange(selectedValues)
    } else {
      onChange(selectedOption ? selectedOption?.value : '')
    }
  }

  return (
    <div
      className={classNames(classes.dropdownMenu, classes[dropdownSize])}
      hidden={disabled || !isOpen || !!error}
    >
      <div hidden={!searchInput}>{searchInput}</div>

      {map(options, (option, index) => {
        const isSelected = value && value?.includes(option?.value)
        return (
          <li
            key={index}
            className={classes.dropdownMenuItem}
            onClick={() => handleOptionSelect(option)}
          >
            {multiple && (
              <CheckBoxInput
                hidden={!multiple}
                name={name}
                ariaLabel={ariaLabel}
                label={option?.label}
                value={isSelected || false}
                className={classes.option}
              />
            )}
            <SingleOptionDropDown
              isSelected={isSelected || false}
              multiple={multiple}
              optionLabel={option?.label}
            />
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
  )
}

export default DropdownContent
