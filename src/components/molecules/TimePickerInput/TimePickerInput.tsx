import { useState, useEffect, forwardRef, useRef } from 'react'
import TimeColumn from 'components/molecules/TimeColumn/TimeColumn'
import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { FieldError } from 'react-hook-form'
import Icon from 'components/atoms/Icon/Icon'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import { useClickAway } from 'ahooks'
import classNames from 'classnames'

import classes from './styles.module.scss'

type SharedTimeProps = {
  value?: string
  disabled?: boolean
  ariaLabel?: string
  showSeconds?: boolean
  error?: FieldError
}

export type TimePickerInputProps = SharedTimeProps & {
  label?: string
  className?: string
  name: string
  onChange: (value: string) => void
}

export type TimeInputProps = SharedTimeProps & {
  toggleTimeColumnVisible: () => void
}

const formatTimeString = (time: number) =>
  time?.toString().length === 1 ? `0${time}` : time?.toString()

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  function TimeInput(
    { disabled, ariaLabel, value, toggleTimeColumnVisible, error, showSeconds },
    ref
  ) {
    const timePlaceholder = showSeconds ? 'hh:mm:ss' : 'hh:mm'

    return (
      <>
        <input
          className={classNames(
            classes.timeInput,
            disabled && classes.disabledTimeInput,
            error && classes.errorMessage
          )}
          value={value ? value : timePlaceholder}
          type="text"
          onClick={toggleTimeColumnVisible}
          onKeyDown={toggleTimeColumnVisible}
          ref={ref}
          aria-label={ariaLabel}
          readOnly
        />
        <Icon
          icon={Clock}
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
    } = props

    const splittedTimeValue = value?.split(':')

    const hourValue = Number(splittedTimeValue?.[0])
    const minuteValue = Number(splittedTimeValue?.[1])
    const secondValue = Number(splittedTimeValue?.[2])

    const [hour, setHour] = useState<number>(hourValue ? hourValue : 0)
    const [minute, setMinute] = useState<number>(minuteValue ? minuteValue : 0)
    const [second, setSecond] = useState<number>(secondValue ? secondValue : 0)
    const [isTimeColumnOpen, setTimeColumnOpen] = useState<boolean>(false)

    const toggleTimeColumnVisible = () => {
      setTimeColumnOpen(!isTimeColumnOpen)
    }

    const clickAwayInputRef = useRef(null)

    useClickAway(() => {
      setTimeColumnOpen(false)
    }, [clickAwayInputRef])

    useEffect(() => {
      const timeWithSeconds = `${formatTimeString(hour)}:${formatTimeString(
        minute
      )}:${formatTimeString(second)}`
      const formattedTime = `${formatTimeString(hour)}:${formatTimeString(
        minute
      )}`
      onChange(showSeconds ? timeWithSeconds : formattedTime)
    }, [hour, minute, second, onChange, showSeconds])

    return (
      <InputWrapper
        label={label}
        name={name}
        error={error}
        className={className}
        ref={clickAwayInputRef}
      >
        <TimeInput
          disabled={disabled}
          ariaLabel={ariaLabel}
          value={value}
          toggleTimeColumnVisible={toggleTimeColumnVisible}
          error={error}
          showSeconds={showSeconds}
        />
        <div
          className={
            !isTimeColumnOpen || disabled
              ? classes.hiddenContainer
              : classes.timeColumnContainer
          }
        >
          <TimeColumn start={0} end={24} value={hour} setValue={setHour} />
          <TimeColumn start={0} end={60} value={minute} setValue={setMinute} />
          {showSeconds && (
            <TimeColumn
              start={0}
              end={60}
              value={second}
              setValue={setSecond}
            />
          )}
        </div>
      </InputWrapper>
    )
  }
)

export default TimePickerInput
