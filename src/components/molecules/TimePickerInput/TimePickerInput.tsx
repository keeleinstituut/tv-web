import {
  useState,
  useEffect,
  FC,
  forwardRef,
  Ref,
  ForwardedRef,
  useRef,
} from 'react'
import TimeColumn from 'components/molecules/TimeColumn/TimeColumn'
import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { FieldError } from 'react-hook-form'
import Icon from 'components/atoms/Icon/Icon'
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
  onChange: (value: string) => void
  timePicker?: boolean
}

export type TimeInputProps = SharedTimeProps & {
  isTimeColumnVisible: () => void
  inputRef?: Ref<HTMLInputElement> | null
}

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
    }: TimeInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const handleClick = () => {
      if (isTimeColumnVisible) {
        isTimeColumnVisible()
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
          aria-label={ariaLabel}
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

  const isTimeColumnVisible = () => {
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
        isTimeColumnVisible={isTimeColumnVisible}
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
        <TimeColumn start={0} end={60} value={minute} setValue={setMinute} />
        {showSeconds && (
          <TimeColumn start={0} end={60} value={second} setValue={setSecond} />
        )}
      </div>
    </>
  )
}

export default TimePickerInput
