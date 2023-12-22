import React, { useState, forwardRef, useRef, FC, SVGProps } from 'react'
import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import { useClickAway } from 'ahooks'
import classNames from 'classnames'
import { Icon } from '../Button/Button'

import classes from './classes.module.scss'
import TimeDropdown from '../TimeDropdown/TimeDropdown'
import useModalContext from 'hooks/useModalContext'
import useInputMask from 'use-mask-input'

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
  toggleTimeColumnVisible: () => void
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
      onChange(event.target.value)
    }

    return (
      <>
        <input
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
          ref={useInputMask({
            mask: showSeconds ? '99:99:99' : '99:99',
            options: { placeholder: '', jitMasking: true },
          })}
        />
        <Icon
          icon={icon || Clock}
          className={classNames(
            classes.timeIcon,
            disabled && classes.disabledIcon
          )}
        />
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
    const [isTimeColumnOpen, setTimeColumnOpen] = useState<boolean>(false)
    const { modalContentId } = useModalContext()
    const shouldUsePortal = !!modalContentId

    const toggleTimeColumnVisible = () => {
      setIsModalOpen && setIsModalOpen(!isTimeColumnOpen)
      setTimeColumnOpen(!isTimeColumnOpen)
    }

    const clickAwayInputRef = useRef(null)
    const wrapperRef = useRef(null)

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
