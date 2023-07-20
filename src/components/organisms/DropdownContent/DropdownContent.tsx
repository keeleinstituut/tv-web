import { Dispatch, FC, SetStateAction, useState } from 'react'
import classNames from 'classnames'
import { includes, map } from 'lodash'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { SelectionControlsInputProps } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'

type DropdownContentProps = SelectionControlsInputProps & {
  isOpen?: boolean
  selectedOptionObjects?: DropDownOptions[]
  setIsOpen?: Dispatch<SetStateAction<boolean>>
  className?: string
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
  buttons = false,
  onChange,
  setIsOpen,
  errorZIndex,
  className,
}) => {
  const { t } = useTranslation()
  const initialValue = value || multiple ? [] : ''
  const [selectedValue, setSelectedValue] = useState<string | string[]>(
    initialValue
  )

  const handleSingleSelect = (selectedOption: string) => {
    onChange(selectedOption ? selectedOption : '')
  }

  const handleMultipleSelect = (selectedOption: string) => {
    // TODO: type of value and of selectedValue should be inferred from "multiple" prop
    const typedSelectedValue = selectedValue as string[]
    const optionIndex = typedSelectedValue.indexOf(selectedOption)

    const newSelectedValues =
      optionIndex === -1
        ? [...typedSelectedValue, selectedOption]
        : typedSelectedValue.filter((value) => value !== selectedOption)

    setSelectedValue(newSelectedValues)

    if (setIsOpen) {
      setIsOpen(true)
    }
  }

  const handleOnSave = () => {
    onChange(selectedValue)
    if (setIsOpen) {
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setSelectedValue(initialValue)
    if (setIsOpen) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <div
        className={classNames(
          classes.dropdownMenu,
          classes[dropdownSize],
          className
        )}
        style={{
          zIndex: 51 + (errorZIndex || 0),
        }}
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
                    ariaLabel={option?.label || ''}
                    label={option.label}
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
              {t('button.cancel')}
            </Button>
            <Button
              appearance={AppearanceTypes.Primary}
              size={SizeTypes.S}
              onClick={handleOnSave}
              className={classes.dropdownButton}
            >
              {t('button.save')}
            </Button>
          </div>
        </ul>
      </div>
    </>
  )
}

export default DropdownContent
