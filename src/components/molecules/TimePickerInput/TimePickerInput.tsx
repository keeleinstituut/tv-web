import {
  useState,
  useEffect,
  FC,
  forwardRef,
  Ref,
  ForwardedRef,
  useRef,
} from 'react'
import TimeColumn from 'components/atoms/TimeColumn/TimeColumn'
import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { FieldError } from 'react-hook-form'
import Icon from 'components/atoms/Icon/Icon'
import classNames from 'classnames'

import classes from './styles.module.scss'

export type TimePickerInputProps = {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  ariaLabel?: string
  error?: FieldError
  showSeconds?: boolean
  timePicker?: boolean
}

export type TimeInputProps = {
  disabled?: boolean
  ariaLabel?: string
  value?: string
  timeColumnVisibility: () => void
  inputRef?: Ref<HTMLInputElement> | null
  error?: FieldError
  showSeconds?: boolean
}

const TimeInput: FC<TimeInputProps> = forwardRef(
  (
    {
      disabled,
      ariaLabel,
      value,
      timeColumnVisibility,
      inputRef,
      error,
      showSeconds,
    }: TimeInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const handleClick = () => {
      if (timeColumnVisibility) {
        timeColumnVisibility()
      }
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
          ref={inputRef}
        />
        <Icon
          icon={Clock}
          className={classNames(
            classes.timeIcon,
            disabled && classes.disabledIcon
          )}
          ariaLabel={ariaLabel}
        />
      </>
    )
  }
)

const TimePickerInput = ({
  onChange,
  disabled,
  ariaLabel,
  value,
  error,
  showSeconds,
  timePicker,
}: TimePickerInputProps) => {
  const [hour, setHour] = useState<string>('00')
  const [minute, setMinute] = useState<string>('00')
  const [second, setSecond] = useState<string>('00')
  const [isTimeColumnOpen, setTimeColumnOpen] = useState<boolean>(false)

  const timeColumnVisibility = () => {
    setTimeColumnOpen((prevState) => !prevState)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      timeColumnRef.current &&
      !timeColumnRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setTimeColumnOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const inputRef = useRef<HTMLInputElement>(null)
  const timeColumnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeWithSeconds = `${hour}:${minute}:${second}`
    const formattedTime = `${hour}:${minute}`
    onChange(showSeconds ? timeWithSeconds : formattedTime)
  }, [hour, minute, second, onChange, showSeconds])

  if (!timePicker) return null

  return (
    <>
      <TimeInput
        disabled={disabled}
        ariaLabel={ariaLabel}
        value={value}
        timeColumnVisibility={timeColumnVisibility}
        inputRef={inputRef}
        error={error}
        showSeconds={showSeconds}
      />
      <div
        className={
          !isTimeColumnOpen || disabled
            ? classes.hiddenContainer
            : classes.container
        }
        ref={timeColumnRef}
      >
        <TimeColumn start={0} end={24} value={hour} setValue={setHour} />
        <TimeColumn start={0} end={59} value={minute} setValue={setMinute} />
        {showSeconds && (
          <TimeColumn start={0} end={59} value={second} setValue={setSecond} />
        )}
      </div>
    </>
  )
}

export default TimePickerInput
