import { Dispatch, FC, SetStateAction, useState } from 'react'
import classNames from 'classnames'
import { includes, map } from 'lodash'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { SelectionControlsInputProps } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

import classes from './styles.module.scss'

type DropdownContentProps = SelectionControlsInputProps & {
  isOpen?: boolean
  selectedOptionObjects?: { label: string; value: string }[]
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

const DropdownContent: FC<DropdownContentProps> = ({
  dropdownSize = 'l',
  disabled,
  isOpen,
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
  setIsOpen,
  helperText,
  selectedOptionObjects,
  tags,
}) => {
  const [selectedValue, setSelectedValue] = useState<string[]>(
    value ? (Array.isArray(value) ? value : [value]) : []
  )

  const handleSingleSelect = (selectedOption: string) => {
    onChange(selectedOption ? selectedOption : '')
  }

  const handleMultipleSelect = (selectedOption: string) => {
    const selectedValues = Array.isArray(selectedValue)
      ? [...selectedValue]
      : []
    const optionIndex = selectedValues.indexOf(selectedOption)

    const newSelectedValues =
      optionIndex === -1
        ? [...selectedValues, selectedOption]
        : selectedValues.filter((value) => value !== selectedOption)

    setSelectedValue(newSelectedValues)

    if (setIsOpen) {
      setIsOpen(true)
    }
  }

  const handleOnSave = () => {
    onChange(selectedValue)
  }

  const handleCancel = () => {
    setSelectedValue([])
  }

  return (
    <>
      <div
        className={classNames(classes.dropdownMenu, classes[dropdownSize])}
        hidden={disabled || !isOpen}
      >
        <div hidden={!searchInput}>{searchInput}</div>

        <ul>
          {map(options, (option, index) => {
            const isMultiSelected =
              selectedValue && includes(selectedValue, option?.value)
            const isSingleSelected = value && includes(value, option?.value)

            return (
              <li key={index} className={classes.dropdownMenuItem}>
                {multiple && (
                  <CheckBoxInput
                    name={name}
                    ariaLabel={ariaLabel}
                    label={option?.label}
                    value={isMultiSelected || false}
                    className={classes.option}
                    onChange={() => handleMultipleSelect(option?.value)}
                  />
                )}
                <p
                  className={classNames(
                    classes.option,
                    isSingleSelected && classes.selectedOption
                  )}
                  hidden={multiple}
                  onClick={() => handleSingleSelect(option?.value)}
                >
                  {option?.label}
                </p>
              </li>
            )
          })}
          <div
            hidden={!buttons}
            className={classNames(buttons && classes.buttonsContainer)}
          >
            <Button
              appearance={AppearanceTypes.Secondary}
              size={SizeTypes.S}
              onClick={handleCancel}
            >
              {cancelButtonLabel}
            </Button>
            <Button
              appearance={AppearanceTypes.Primary}
              size={SizeTypes.S}
              onClick={handleOnSave}
              className={classes.dropdownButton}
            >
              {proceedButtonLabel}
            </Button>
          </div>
        </ul>
      </div>

      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>

      <div className={classNames(tags && classes.tagsContainer)}>
        {map(selectedOptionObjects, ({ label }, index) => {
          return (
            <span hidden={!tags} className={classes.tag} key={index}>
              {label}
            </span>
          )
        })}
      </div>
    </>
  )
}

export default DropdownContent
