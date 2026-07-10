import React, { useState, forwardRef, useRef, FC, SVGProps } from 'react'
import Clock from 'assets/icons/clock.svg?react'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import { useClickAway } from 'ahooks'
import classNames from 'classnames'
import { Icon } from '../Button/Button'
import TimeDropdown from '../TimeDropdown/TimeDropdown'
import useModalContext from 'hooks/useModalContext'
import { useInputMask } from 'use-mask-input'
import { mergeRefs } from 'react-merge-refs'

import classes from './classes.module.scss'

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
  onClick?: () => void
  handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  function TimeInput(
    {
      disabled,
      ariaLabel,
      value,
      error,
      showSeconds,
      name,
      onChange,
      icon,
      handleKeyDown,
      onClick,
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
          autoComplete="off"
          className={classNames(
            classes.timeInput,
            disabled && classes.disabledTimeInput,
            error && classes.error
          )}
          tabIndex={0}
          type="text"
          value={value ? value : ''}
          aria-label={ariaLabel}
          onClick={onClick}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          id={name}
          {...(placeholder ? { placeholder } : {})}
          ref={mergeRefs([
            ref,
            useInputMask({
              mask: showSeconds ? '99:99:99' : '99:99',
              options: { placeholder: '', jitMasking: true },
            }),
          ])}
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

    const clickAwayInputRef = useRef(null)
    const wrapperRef = useRef(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useClickAway(() => {
      setIsModalOpen?.(false)
      setTimeColumnOpen(false)
    }, [clickAwayInputRef, ...(wrapperRef?.current ? [wrapperRef] : [])])

    const handleClick = () => {
      setTimeColumnOpen(!isTimeColumnOpen)
      inputRef.current?.focus()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        setTimeColumnOpen(!isTimeColumnOpen)
        event.preventDefault()
      }
      if (event.key === 'Tab' && isTimeColumnOpen) {
        event.preventDefault()
        if (wrapperRef.current) {
          const inputElement = (
            clickAwayInputRef.current as unknown as HTMLElement
          ).querySelector('button')
          inputElement?.focus()
        }
      }
    }

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
        <div
          className={classNames(
            classes.timeFieldClickTarget,
            disabled && classes.timeFieldClickTargetDisabled
          )}
          onClick={disabled ? undefined : handleClick}
        >
          <TimeInput
            name={name}
            disabled={disabled}
            ariaLabel={ariaLabel}
            value={value}
            error={error}
            showSeconds={showSeconds}
            onChange={onChange}
            ref={mergeRefs([ref, inputRef])}
            icon={icon}
            handleKeyDown={handleKeyDown}
          />
        </div>
        <TimeDropdown
          wrapperRef={wrapperRef}
          clickAwayInputRef={clickAwayInputRef}
          isTimeColumnOpen={isTimeColumnOpen}
          disabled={disabled}
          onChange={onChange}
          value={value}
          showSeconds={showSeconds}
          errorZIndex={errorZIndex}
          name={name}
          setIsOpen={setTimeColumnOpen}
        />
      </InputWrapper>
    )
  }
)

export default TimePickerInput
