import {
  Dispatch,
  RefObject,
  SetStateAction,
  useState,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import classNames from 'classnames'
import { includes, map, isEmpty, debounce, filter } from 'lodash'
import CheckBoxInput from 'components/molecules/CheckBoxInput/CheckBoxInput'
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

export interface DropdownContentProps extends SelectionControlsInputProps {
  isOpen?: boolean
  selectedOptionObjects?: DropDownOptions[]
  setIsOpen?: Dispatch<SetStateAction<boolean>>
  className?: string
  wrapperRef?: RefObject<HTMLDivElement>
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

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  function DropdownContent(
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
      horizontalScrollContainerId,
      className,
      onSearch,
      loading,
      onEndReached,
    },
    ref
  ) {
    const scrollContainer = useRef(null)
    const { left, top } =
      useElementPosition(
        wrapperRef,
        horizontalScrollContainerId,
        undefined,
        isOpen
      ) || {}

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
        return options
      }
      const regexPattern = new RegExp(searchValue, 'i')
      return filter(options, ({ label }) => regexPattern.test(label))
    }, [onSearch, options, searchValue])

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
          ...(left && top ? { left, top: top + 40 } : {}),
        }}
      >
        <TextInput
          hidden={!showSearch}
          name={`search-${name}`}
          ariaLabel={t('label.search')}
          placeholder={t('placeholder.search')}
          value={searchValue}
          onChange={handleSearch}
          className={classes.searchInput}
          loading={loading}
          isSearch
        />

        <ul ref={scrollContainer}>
          <EmptyContent hidden={!isEmpty(visibleOptions)} />
          {map(visibleOptions, (option) => {
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
                >
                  {option?.label}
                </Button>
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
    )
  }
)

export default DropdownContent
