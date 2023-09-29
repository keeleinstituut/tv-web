import { FC, SVGProps, forwardRef, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as DropdownArrow } from 'assets/icons/dropdown.svg'
import { useClickAway } from 'ahooks'
import DropdownContent from 'components/organisms/DropdownContent/DropdownContent'

import classes from './classes.module.scss'
import { filter, find, map, join } from 'lodash'
import Tag from 'components/atoms/Tag/Tag'
import useModalContext from 'hooks/useModalContext'

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
  loading?: boolean
  onEndReached?: () => void
  hidden?: boolean
  paginationLabelClassName?: string
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
    hidden,
    paginationLabelClassName,
    ...rest
  },
  ref
) {
  // TODO: hopefully we can get rid of usePortal completely and only use it inside modals and tables
  // Or possibly instead we should use it always, but would be good to get rid of this prop
  const { modalContentId } = useModalContext()
  const shouldUsePortal = usePortal || !!modalContentId
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const clickAwayInputRef = useRef(null)
  const wrapperRef = useRef(null)

  useClickAway(() => {
    setIsOpen(false)
  }, [clickAwayInputRef, ...(wrapperRef?.current ? [wrapperRef] : [])])

  const selectedOptionObjects = filter(options, (option) => {
    return !!find(value, (singleValue) => singleValue === option?.value)
  })

  const singleValue: DropDownOptions | undefined = find(options, {
    value,
  }) as unknown as DropDownOptions

  const multiValue = multiple ? selectedOptionObjects : []
  const valueAsArray = multiple ? multiValue : [singleValue]

  const selectedOptionLabels = map(valueAsArray, (value) => value?.label)

  const singleSelectMenuLabel = value
    ? join(selectedOptionLabels, ',')
    : placeholder

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

  if (hidden) return null

  return (
    <InputWrapper
      label={label}
      name={name}
      error={error}
      className={classNames(classes.selectionsContainer, className)}
      wrapperClass={classes[dropdownSize || 'l']}
      ref={shouldUsePortal ? wrapperRef : clickAwayInputRef}
      errorClass={classes.selectionsError}
      errorZIndex={errorZIndex}
      paginationLabelClassName={paginationLabelClassName}
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
        <p
          hidden={!placeholder && multiple}
          className={classNames(
            classes.menuLabel,
            value && !multiple && classes.selectedValue
          )}
        >
          {dropdownMenuLabel}
          {/* Following is a hack for broken behavior of single select inputs without a placeholder */}
          &#8203;
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
      <DropdownContent
        {...{ ...dropdownProps, wrapperRef, clickAwayInputRef, usePortal }}
      />
      <div className={classNames(!hideTags && classes.tagsContainer)}>
        {map(selectedOptionObjects, ({ label }, index) => {
          return (
            <Tag
              hidden={hideTags}
              className={classes.tag}
              value
              key={index}
              label={label}
            />
          )
        })}
      </div>
    </InputWrapper>
  )
})

export default SelectionControlsInput
