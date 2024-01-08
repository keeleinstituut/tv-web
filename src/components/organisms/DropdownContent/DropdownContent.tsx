import {
  Dispatch,
  RefObject,
  SetStateAction,
  useState,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  FC,
  useEffect,
} from 'react'
import classNames from 'classnames'
import { includes, map, isEmpty, debounce, filter, find } from 'lodash'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
import { useClickAway, useInViewport } from 'ahooks'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { SelectionControlsInputProps } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import useElementPosition from 'hooks/useElementPosition'
import useEndReached from 'hooks/useEndReached'
import TextInput from 'components/molecules/TextInput/TextInput'
import { createPortal } from 'react-dom'
import useTableContext from 'hooks/useTableContext'
import useModalContext from 'hooks/useModalContext'
import { escapeSearchString } from 'helpers'

interface DropdownContentComponentProps extends SelectionControlsInputProps {
  isOpen?: boolean
  selectedOptionObjects?: DropDownOptions[]
  setIsOpen?: Dispatch<SetStateAction<boolean>>
  className?: string
  wrapperRef?: RefObject<HTMLDivElement>
  isCustomSingleDropdown?: boolean
  isRequired?: boolean
}

const EmptyContent = ({ hidden }: { hidden?: boolean }) => {
  const { t } = useTranslation()
  if (hidden) return null
  return (
    <li className={classes.dropdownMenuItem}>
      <p className={classes.option}>{t('placeholder.empty_list')}</p>
    </li>
  )
}

const DropdownContentComponent = forwardRef<
  HTMLDivElement,
  DropdownContentComponentProps
>(function DropdownContentComponent(
  {
    dropdownSize = 'l',
    disabled,
    isOpen,
    showSearch,
    options,
    multiple = false,
    value,
    name,
    buttons = false,
    onChange,
    setIsOpen,
    errorZIndex,
    wrapperRef,
    className,
    onSearch,
    loading,
    onEndReached,
    isCustomSingleDropdown = false,
    isRequired,
  },
  ref
) {
  const { tableRef } = useTableContext()
  const { modalContentId } = useModalContext()
  const optionsToUse = useMemo(() => {
    if (isRequired || multiple) return options
    const emptyOptionsExists = !!find(options, { value: '' })
    if (emptyOptionsExists) return options
    return [{ label: '', value: '' }, ...options]
  }, [isRequired, multiple, options])

  const scrollContainer = useRef(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const typedRef = ref as RefObject<HTMLDivElement>
  const [inViewport, ratio] = useInViewport(typedRef, {
    root: tableRef as RefObject<HTMLDivElement> | undefined,
  })
  const {
    left = 0,
    top = 0,
    right = 0,
  } = useElementPosition({
    ref: wrapperRef,
    forceRecalculate: isOpen,
  }) || {}

  useClickAway(() => {
    if (setIsOpen) {
      setIsOpen(false)
    }
  }, [typedRef, wrapperRef])

  // TODO: possibly also move this to "useElementPosition"
  const useLeftPosition = useMemo(
    () => (ratio || ratio === 0) && ratio < 1 && inViewport && !modalContentId,
    // isDragAndDropOpen changes, when this component is displayed
    // We don't want to update this state during any other time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inViewport]
  )

  const { t } = useTranslation()

  // Does nothing if onEndReached is not defined or scrollContainer is not defined
  // 60 is offset in px, we want to call the function before we reach the actual end
  useEndReached(scrollContainer, onEndReached, 60)

  const initialValue = value || (multiple ? [] : '')
  const [selectedValue, setSelectedValue] = useState<string | string[]>(
    initialValue
  )
  const [searchValue, setSearchValue] = useState<string>('')

  const visibleOptions = useMemo(() => {
    if (onSearch || !searchValue) {
      return optionsToUse
    }
    // Doing this search for some reason ?
    const regexPattern = new RegExp(escapeSearchString(searchValue), 'i')
    return filter(optionsToUse, ({ label }) => regexPattern.test(label))
  }, [onSearch, optionsToUse, searchValue])

  useEffect(() => {
    setSelectedValue(initialValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleSingleSelect = (selectedOption: string) => {
    onChange(selectedOption ? selectedOption : '')

    if (setIsOpen) {
      setIsOpen(false)
    }
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

  const handleSearch = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      if (onSearch) {
        debounce(onSearch, 300)(event.target.value)
      }
    },
    [onSearch]
  )

  if (disabled || !isOpen) return null

  return (
    <div
      className={classNames(
        classes.dropdownMenu,
        showSearch ? classes.l : classes[dropdownSize],
        className
      )}
      ref={ref}
      style={{
        zIndex: 51 + (errorZIndex || 0),
        ...(wrapperRef
          ? {
              left: useLeftPosition ? 'unset' : left - 2,
              right: useLeftPosition ? right - left : 'unset',
              top: top + 40,
            }
          : {}),
      }}
    >
      <TextInput
        ref={searchInputRef}
        hidden={!showSearch}
        name={`search-${name}`}
        ariaLabel={t('label.search')}
        placeholder={t('placeholder.search')}
        value={searchValue}
        onChange={handleSearch}
        className={classes.searchInput}
        loading={loading}
        isSearch
        autoFocus={showSearch && isOpen}
      />

      <ul ref={scrollContainer}>
        <EmptyContent hidden={!isEmpty(visibleOptions)} />
        {map(visibleOptions, (option, index) => {
          const isMultiSelected =
            selectedValue && includes(selectedValue, option?.value)
          const isSingleSelected = value && includes(value, option?.value)

          return (
            <li key={option.value} className={classes.dropdownMenuItem}>
              {multiple && (
                <CheckBoxInput
                  name={name}
                  ariaLabel={option?.label || ''}
                  label={option.label}
                  value={isMultiSelected || false}
                  className={classes.option}
                  onChange={() => handleMultipleSelect(option?.value)}
                  autoFocus={!showSearch && isOpen && index === 0}
                />
              )}
              <Button
                className={classNames(
                  classes.option,
                  isSingleSelected && classes.selectedOption
                )}
                hidden={multiple}
                appearance={AppearanceTypes.Text}
                onClick={() => handleSingleSelect(option?.value)}
                autoFocus={!showSearch && isOpen && index === 0}
              >
                {option?.label}
              </Button>
            </li>
          )
        })}
      </ul>
      <div
        hidden={!buttons}
        className={classNames(
          buttons && !isCustomSingleDropdown && classes.buttonsContainer
        )}
      >
        <Button
          appearance={AppearanceTypes.Secondary}
          size={SizeTypes.S}
          onClick={handleCancel}
          hidden={isCustomSingleDropdown}
        >
          {t('button.dropdown_cancel')}
        </Button>
        <Button
          appearance={AppearanceTypes.Primary}
          size={SizeTypes.S}
          onClick={handleOnSave}
          className={classes.dropdownButton}
          hidden={isCustomSingleDropdown}
        >
          {t('button.save')}
        </Button>
      </div>
    </div>
  )
})

export interface DropdownContentProps extends DropdownContentComponentProps {
  clickAwayInputRef?: RefObject<HTMLDivElement>
  wrapperRef?: RefObject<HTMLDivElement>
  usePortal?: boolean
}

const DropdownContent: FC<DropdownContentProps> = ({
  wrapperRef,
  clickAwayInputRef,
  usePortal,
  ...rest
}) => {
  const { modalContentId } = useModalContext()
  const shouldUsePortal = usePortal || !!modalContentId
  if (shouldUsePortal) {
    return createPortal(
      <DropdownContentComponent
        {...rest}
        wrapperRef={wrapperRef}
        ref={clickAwayInputRef}
      />,
      document.getElementById(modalContentId || 'root') || document.body
    )
  }
  return <DropdownContentComponent {...rest} />
}

export default DropdownContent
