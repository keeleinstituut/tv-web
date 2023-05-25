import { useState, forwardRef, useRef } from 'react'
import TimeColumn from 'components/molecules/TimeColumn/TimeColumn'
import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { ReactComponent as Alarm } from 'assets/icons/alarm.svg'
import { FieldError } from 'react-hook-form'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'
import { useClickAway } from 'ahooks'
import { withMask } from 'use-mask-input'
import classNames from 'classnames'

import classes from './styles.module.scss'

type SharedTimeProps = {
  value?: string
  disabled?: boolean
  ariaLabel?: string
  showSeconds?: boolean
  error?: FieldError
  name: string
  onChange: (value: string) => void
  range?: boolean
}

export type TimePickerInputProps = SharedTimeProps & {
  label?: string
  className?: string
}

export type TimeInputProps = SharedTimeProps & {
  toggleTimeColumnVisible: () => void
}

const formatTimeString = (time: number) =>
  time?.toString().length === 1 ? `0${time}` : time?.toString()

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
      // timePickerLineClass,
      range,
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

    return (
      <>
        <input
          className={classNames(
            disabled && classes.disabledTimeInput,
            error && classes.errorMessage,
            // range ? classes.rangeTimeInput : classes.timeInput
            classes.timeInput
          )}
          type="text"
          value={value ? value : ''}
          onFocus={toggleTimeColumnVisible}
          aria-label={ariaLabel}
          onChange={handleInputChange}
          id={name}
          {...(placeholder ? { placeholder } : {})}
          required
          ref={withMask(showSeconds ? '99:99:99' : '99:99', {
            placeholder: '0',
          })}
        />
        <Clock
          className={classNames(
            disabled && classes.disabledIcon,
            // range ? classes.rangeTimeIcon : classes.timeIcon
            // icon={range ? Alarm : Clock}
            classes.timeIcon
          )}
        />
        {/* <div className={range ? timePickerLineClass : ''} /> */}
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
      //     timePickerLineClass,
      range,
    } = props

    const splittedTimeValue = value?.split(':')

    const hourValue = Number(splittedTimeValue?.[0]) || 0
    const minuteValue = Number(splittedTimeValue?.[1]) || 0
    const secondValue = Number(splittedTimeValue?.[2]) || 0

    const [isTimeColumnOpen, setTimeColumnOpen] = useState<boolean>(false)

    const toggleTimeColumnVisible = () => {
      setTimeColumnOpen(!isTimeColumnOpen)
    }

    const clickAwayInputRef = useRef(null)

    useClickAway(() => {
      setTimeColumnOpen(false)
    }, [clickAwayInputRef])

    const handleSetHour = (newHour: number) => {
      const timeWithSeconds = `${formatTimeString(newHour)}:${formatTimeString(
        minuteValue
      )}:${formatTimeString(secondValue)}`
      const formattedTime = `${formatTimeString(newHour)}:${formatTimeString(
        minuteValue
      )}`
      onChange(showSeconds ? timeWithSeconds : formattedTime)
    }

    const handleSetMinute = (newMinute: number) => {
      const timeWithSeconds = `${formatTimeString(
        hourValue
      )}:${formatTimeString(newMinute)}:${formatTimeString(secondValue)}`
      const formattedTime = `${formatTimeString(hourValue)}:${formatTimeString(
        newMinute
      )}`
      onChange(showSeconds ? timeWithSeconds : formattedTime)
    }

    const handleSetSecond = (newSecond: number) => {
      const timeWithSeconds = `${formatTimeString(
        hourValue
      )}:${formatTimeString(minuteValue)}:${formatTimeString(newSecond)}`

      onChange(timeWithSeconds)
    }

    const rangeContainerClass = range
      ? classes.rangeContainer
      : classes.container

    return (
      <InputWrapper
        label={label}
        name={name}
        error={error}
        className={className}
        ref={clickAwayInputRef}
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
          range={range}
          // timePickerLineClass={timePickerLineClass}
        />
        <div
          className={
            !isTimeColumnOpen || disabled
              ? classes.hiddenContainer
              : classes.timeColumnContainer
          }
          // className={
          //   !isTimeColumnOpen || disabled
          //     ? classes.hiddenContainer
          //     : rangeContainerClass
          // }
        >
          <TimeColumn
            start={0}
            end={24}
            value={hourValue}
            setValue={handleSetHour}
            isTimeColumnOpen={isTimeColumnOpen}
          />
          <TimeColumn
            start={0}
            end={60}
            value={minuteValue}
            setValue={handleSetMinute}
            isTimeColumnOpen={isTimeColumnOpen}
          />
          {showSeconds && (
            <TimeColumn
              start={0}
              end={60}
              value={secondValue}
              setValue={handleSetSecond}
              isTimeColumnOpen={isTimeColumnOpen}
            />
          )}
        </div>
      </InputWrapper>
    )
  }
)

export default TimePickerInput
