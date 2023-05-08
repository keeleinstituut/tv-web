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

import classes from './styles.module.scss'
import Icon from 'components/atoms/Icon/Icon'
import classNames from 'classnames'

export type TimePickerInputProps = {
  value?: string
  onChange: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  ariaLabel?: string
}

export type TimeInputProps = {
  disabled?: boolean
  ariaLabel?: string
  value?: string
  timeColumnVisibility: () => void
  inputRef?: Ref<HTMLInputElement> | null
}

const TimeInput: FC<TimeInputProps> = forwardRef(
  (
    {
      disabled,
      ariaLabel,
      value,
      timeColumnVisibility,
      inputRef,
      ...rest
    }: TimeInputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const handleClick = () => {
      if (timeColumnVisibility) {
        timeColumnVisibility()
      }
    }

    return (
      <>
        <input
          value={value ? value : 'hh:mm:ss'}
          type="text"
          onClick={handleClick}
          ref={inputRef}
          {...rest}
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
  defaultValue,
  disabled,
  ariaLabel,
  value,
}: TimePickerInputProps) => {
  const [hour, setHour] = useState(
    defaultValue ? defaultValue.split(':')[0] : '00'
  )
  const [minute, setMinute] = useState(
    defaultValue ? defaultValue.split(':')[1] : '00'
  )
  const [second, setSecond] = useState(
    defaultValue ? defaultValue.split(':')[2] : '00'
  )
  const [isTimeColumnOpen, setTimeColumnOpen] = useState<boolean>(false)

  const timeColumnVisibility = () => {
    setTimeColumnOpen((prevState) => !prevState)
  }

  console.log('isTimeColumnOpen: ', isTimeColumnOpen)

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
    onChange && onChange(`${hour}:${minute}:${second}`)
  }, [hour, minute, second])

  return (
    <>
      <TimeInput
        disabled={disabled}
        ariaLabel={ariaLabel}
        value={value}
        timeColumnVisibility={timeColumnVisibility}
        inputRef={inputRef}
      />
      <div
        className={
          isTimeColumnOpen ? classes.container : classes.hiddenContainer
        }
        ref={timeColumnRef}
      >
        <TimeColumn start={0} end={24} value={hour} setValue={setHour} />
        <TimeColumn start={0} end={59} value={minute} setValue={setMinute} />
        <TimeColumn start={0} end={59} value={second} setValue={setSecond} />
      </div>
    </>
  )
}

export default TimePickerInput
