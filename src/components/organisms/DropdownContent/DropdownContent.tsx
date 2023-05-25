import { FC } from 'react'
import classNames from 'classnames'
import { includes, map } from 'lodash'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { SelectionControlsInputProps } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

import classes from './styles.module.scss'

type DropdownContentProps = SelectionControlsInputProps & {
  isOpen?: boolean
  selectedOptionObjects?: { label: string; value: string }[]
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
  helperText,
  selectedOptionObjects,
  tags,
}) => {
  const handleOptionSelect = (selectedOption: {
    label: string
    value: string
  }) => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? [...value] : []
      const optionIndex = selectedValues?.indexOf(selectedOption?.value)

      const newSelectedValues =
        optionIndex === -1
          ? [...selectedValues, selectedOption?.value]
          : selectedValues?.filter((value) => value !== selectedOption?.value)

      onChange(newSelectedValues)
    } else {
      onChange(selectedOption ? selectedOption?.value : '')
    }
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
            const isSelected = value && includes(value, option?.value)

            return (
              <li key={index} className={classes.dropdownMenuItem}>
                {multiple && (
                  <CheckBoxInput
                    name={name}
                    ariaLabel={ariaLabel}
                    label={option?.label}
                    value={isSelected || false}
                    className={classes.option}
                    onChange={() => handleOptionSelect(option)}
                  />
                )}
                <p
                  className={classNames(
                    classes.option,
                    isSelected && classes.selectedOption
                  )}
                  hidden={multiple}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option?.label}
                </p>
              </li>
            )
          })}
        </ul>

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
