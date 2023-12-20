import { useState, forwardRef, useRef, FC, SVGProps, useEffect } from 'react'
import TimeColumn from 'components/molecules/TimeColumn/TimeColumn'
import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import { useClickAway } from 'ahooks'
import { withMask } from 'use-mask-input'
import classNames from 'classnames'
import { Icon } from '../Button/Button'

import classes from './classes.module.scss'
import TimeDropdown from '../TimeDropdown/TimeDropdown'
import useModalContext from 'hooks/useModalContext'
import BaseButton, {
  BaseButtonProps,
} from 'components/atoms/BaseButton/BaseButton'

export type SharedTimeProps = {
  value?: string
  disabled?: boolean
  ariaLabel?: string
  showSeconds?: boolean
  error?: FieldError
  name: string
  errorZIndex?: number
  onChange: (value: string) => void
  icon?: FC<SVGProps<SVGSVGElement>>
}

export type TimePickerInputProps = SharedTimeProps & {
  label?: string
  className?: string
  setIsModalOpen?: (value: boolean) => void
}

export type TimeInputProps = SharedTimeProps & {
  toggleTimeColumnVisible: BaseButtonProps['onClick']
}

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  function TimeInput(
    {
      disabled,
      ariaLabel,
      value,
      toggleTimeColumnVisible,
      error,
      showSeconds,
      name,
      onChange,
      icon,
    },
    ref
  ) {
    const placeholder = showSeconds ? 'hh:mm:ss' : 'hh:mm'

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value

      const withoutSecondsRegex = /^([01]?[0-9]?|2[0-3]?)(:[0-5]?[0-9]?)?$/
      const secondsRegex =
        /^([01]?[0-9]?|2[0-3]?)(:[0-5]?[0-9]?)?(:[0-5]?[0-9]?)?$/

      const regex = showSeconds ? secondsRegex : withoutSecondsRegex

      if (regex.test(inputValue)) {
        onChange(inputValue)
      }
    }
    console.log(value)
    return (
      <>
        {/* <input
          className={classNames(
            classes.timeInput,
            disabled && classes.disabledTimeInput,
            error && classes.error
          )}
          type="text"
          value={value ? value : ''}
          onFocus={toggleTimeColumnVisible}
          aria-label={ariaLabel}
          onChange={handleInputChange}
          id={name}
          {...(placeholder ? { placeholder } : {})}
          ref={withMask(showSeconds ? '99:99:99' : '99:99', {
            placeholder: '0',
          })}
        /> */}

        <BaseButton
          className={classNames(
            classes.timeInput,
            disabled && classes.disabledTimeInput,
            error && classes.error
          )}
          id={name}
          disabled={disabled}
          // ref={ref}
          onClick={toggleTimeColumnVisible}
          aria-label={ariaLabel}
        >
          <p
            ref={withMask(showSeconds ? '99:99:99' : '99:99', {
              placeholder: '0',
            })}
          >
            {value ? value : placeholder || ''}
          </p>
          <Icon
            icon={icon || Clock}
            className={classNames(
              classes.timeIcon,
              disabled && classes.disabledIcon
            )}
          />
        </BaseButton>
        {/* <Icon
          icon={icon || Clock}
          className={classNames(
            classes.timeIcon,
            disabled && classes.disabledIcon
          )}
        /> */}
      </>
    )
  }
)

const TimePickerInput = forwardRef<HTMLInputElement, TimePickerInputProps>(
  function TimePickerInput(props, ref) {
    const {
      onChange,
      disabled,
      ariaLabel,
      value,
      error,
      showSeconds,
      label,
      className,
      name,
      errorZIndex,
      icon,
      setIsModalOpen,
    } = props
    //console.log('piker valeu', value)
    const [focusElement, setFocusElement] = useState<HTMLElement | null>(null)
    const [isTimeColumnOpen, setTimeColumnOpen] = useState<boolean>(false)
    const { modalContentId } = useModalContext()
    const shouldUsePortal = !!modalContentId

    const toggleTimeColumnVisible: BaseButtonProps['onClick'] = (event) => {
      setIsModalOpen && setIsModalOpen(!isTimeColumnOpen)
      setTimeColumnOpen(!isTimeColumnOpen)
      if (!document.querySelector('.time-focus') && !isTimeColumnOpen) {
        const target = event?.target as HTMLElement
        target.classList.add('time-focus')
        setFocusElement(target)
      }
    }

    const clickAwayInputRef = useRef(null)
    const wrapperRef = useRef(null)

    useEffect(() => {
      if (document.querySelector('.time-focus') && !isTimeColumnOpen) {
        focusElement?.classList.remove('time-focus')
        focusElement?.focus()
      }
    }, [focusElement, isTimeColumnOpen])

    useClickAway(() => {
      setIsModalOpen && setIsModalOpen(false)
      setTimeColumnOpen(false)
    }, [clickAwayInputRef, ...(wrapperRef?.current ? [wrapperRef] : [])])

    return (
      <InputWrapper
        label={label}
        name={name}
        error={error}
        className={className}
        ref={shouldUsePortal ? wrapperRef : clickAwayInputRef}
        wrapperClass={classes.timePickerWrapper}
        errorZIndex={errorZIndex}
      >
        <TimeInput
          name={name}
          disabled={disabled}
          ariaLabel={ariaLabel}
          value={value}
          toggleTimeColumnVisible={toggleTimeColumnVisible}
          error={error}
          showSeconds={showSeconds}
          onChange={onChange}
          ref={ref}
          icon={icon}
        />
        <TimeDropdown
          wrapperRef={wrapperRef}
          clickAwayInputRef={clickAwayInputRef}
          isTimeColumnOpen={isTimeColumnOpen}
          disabled={disabled}
          onChange={onChange}
          value={value}
          showSeconds={showSeconds}
          name={name}
          setIsOpen={setTimeColumnOpen}
        />
      </InputWrapper>
    )
  }
)

export default TimePickerInput
