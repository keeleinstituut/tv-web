import { useState, useEffect, FC, forwardRef, Ref, useRef } from 'react'
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
  onChange: (value: string) => void
}

export type TimePickerInputProps = SharedTimeProps & {
  label?: string
  className?: string
  name: string
}

export type TimeInputProps = SharedTimeProps & {
  isTimeColumnVisible: () => void
  inputRef?: Ref<HTMLInputElement> | null
}

const formatTimeString = (time: number) =>
  time?.toString().length === 1 ? `0${time}` : time?.toString()

const TimeInput: FC<TimeInputProps> = forwardRef(
  (
    {
      disabled,
      ariaLabel,
      value,
      isTimeColumnVisible,
      inputRef,
      error,
      showSeconds,
      onChange,
    }: TimeInputProps,
    ref
  ) => {
    const handleClick = () => {
      if (isTimeColumnVisible) {
        isTimeColumnVisible()
      }
    }
    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value)
    }

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
          onClick={handleClick}
          onKeyDown={handleClick}
          ref={inputRef}
          aria-label={ariaLabel}
          onChange={handleTimeChange}
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

    const isTimeColumnVisible = () => {
      setTimeColumnOpen((prevState) => !prevState)
    }

    const clickAwayInputRef = useRef(null)
    const timeColumnContainerRef = useRef(null)

    useClickAway(() => {
      setTimeColumnOpen(false)
    }, [clickAwayInputRef, timeColumnContainerRef])

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
      >
        <TimeInput
          disabled={disabled}
          ariaLabel={ariaLabel}
          value={value}
          isTimeColumnVisible={isTimeColumnVisible}
          inputRef={clickAwayInputRef}
          error={error}
          showSeconds={showSeconds}
          onChange={onChange}
        />
        <div
          className={
            !isTimeColumnOpen || disabled
              ? classes.hiddenContainer
              : classes.timeColumnContainer
          }
          ref={timeColumnContainerRef}
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
