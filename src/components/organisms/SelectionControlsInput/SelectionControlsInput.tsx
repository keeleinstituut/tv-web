import {
  FC,
  RefObject,
  SVGProps,
  forwardRef,
  useMemo,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'
import { createPortal } from 'react-dom'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { useClickAway } from 'ahooks'
import DropdownContent, {
  DropdownContentProps,
} from 'components/organisms/DropdownContent/DropdownContent'

import classes from './classes.module.scss'
import { filter, find, map } from 'lodash'
import Tag from 'components/atoms/Tag/Tag'

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

// TODO: currently DropdownContent child extends the props of it's parent (SelectionControlsInput)
// Should be the other way around, to prevent child from accepting a ton of props it doesn't use
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
  showSearch?: boolean
  onSearch?: (value: string) => void
  dropdownSize?: DropdownSizeTypes
  hideTags?: boolean
  className?: string
  selectIcon?: FC<SVGProps<SVGSVGElement>>
  errorZIndex?: number
  usePortal?: boolean
  horizontalScrollContainerId?: string
}

interface PositionedDropdownContentProps extends DropdownContentProps {
  clickAwayInputRef?: RefObject<HTMLDivElement>
  wrapperRef?: RefObject<HTMLDivElement>
  usePortal?: boolean
}

const PositionedDropdownContent: FC<PositionedDropdownContentProps> = ({
  wrapperRef,
  clickAwayInputRef,
  usePortal,
  ...rest
}) => {
  if (usePortal) {
    return createPortal(
      <DropdownContent
        {...rest}
        wrapperRef={wrapperRef}
        ref={clickAwayInputRef}
      />,
      document.getElementById('root') || document.body
    )
  }
  return <DropdownContent {...rest} />
}

const SelectionControlsInput = forwardRef<
  HTMLButtonElement,
  SelectionControlsInputProps
>(function SelectionControlsInput(
  {
    label,
    name,
    value,
    error,
    options,
    disabled,
    placeholder,
    multiple = false,
    helperText,
    dropdownSize,
    errorZIndex,
    hideTags = false,
    className,
    selectIcon,
    usePortal,
    ...rest
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const clickAwayInputRef = useRef(null)
  const wrapperRef = useRef(null)

  useClickAway(() => {
    setIsOpen(false)
  }, [clickAwayInputRef, ...(wrapperRef?.current ? [wrapperRef] : [])])

  const selectedOptionObjects = filter(
    options,
    (option) =>
      !!find(value, (singleValue) =>
        multiple ? singleValue === option?.value : value === option?.value
      )
  )

  const singleValue: DropDownOptions | undefined = find(options, {
    value,
  }) as unknown as DropDownOptions

  const multiValue = multiple ? selectedOptionObjects : []
  const valueAsArray = multiple ? multiValue : [singleValue]

  const selectedOptionLabels = map(valueAsArray, (value) => value?.label)

  const singleSelectMenuLabel = value ? selectedOptionLabels : placeholder

  const dropdownMenuLabel = multiple ? placeholder : singleSelectMenuLabel

  const SelectInputArrow = selectIcon || DropdownArrow

  const dropdownProps = useMemo(
    () => ({
      name,
      options,
      dropdownSize,
      disabled,
      isOpen,
      multiple,
      value,
      setIsOpen,
      errorZIndex,
      ...rest,
    }),
    [
      rest,
      disabled,
      dropdownSize,
      errorZIndex,
      isOpen,
      multiple,
      name,
      options,
      value,
    ]
  )

  return (
    <InputWrapper
      label={label}
      name={name}
      error={error}
      className={classNames(classes.selectionsContainer, className)}
      wrapperClass={classes[dropdownSize || 'l']}
      ref={usePortal ? wrapperRef : clickAwayInputRef}
      errorClass={classes.selectionsError}
      errorZIndex={errorZIndex}
    >
      <BaseButton
        className={classNames(
          classes.toggleDropdown,
          error && classes.error,
          classes[dropdownSize || 'l']
        )}
        id={name}
        ref={ref}
        disabled={disabled}
        onClick={toggleDropdown}
      >
        <p hidden={!placeholder} className={classes.menuLabel}>
          {dropdownMenuLabel}
        </p>

        <SelectInputArrow
          className={classNames(
            isOpen && !error && !disabled && classes.openDropdownIcon
          )}
        />
      </BaseButton>
      <p hidden={!helperText} className={classes.helperText}>
        {helperText}
      </p>
      <PositionedDropdownContent
        {...{ ...dropdownProps, wrapperRef, clickAwayInputRef, usePortal }}
      />
      <div className={classNames(!hideTags && classes.tagsContainer)}>
        {map(selectedOptionObjects, ({ label }, index) => (
          <Tag
            hidden={hideTags}
            className={classes.tag}
            value
            key={index}
            label={label}
          />
        ))}
      </div>
    </InputWrapper>
  )
})

export default SelectionControlsInput
