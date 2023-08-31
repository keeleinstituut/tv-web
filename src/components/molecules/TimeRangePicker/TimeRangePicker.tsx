import { forwardRef, useCallback } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'
import classes from './classes.module.scss'
import TimePickerInput from 'components/molecules/TimePickerInput/TimePickerInput'

export interface TimeRangePickerProps {
  onChange: (value: { start?: string; end?: string }) => void
  value?: { start: string; end: string }
  label?: string
  error?: FieldError
  name: string
  hidden?: boolean
  className?: string
}

const TimeRangePicker = forwardRef<HTMLInputElement, TimeRangePickerProps>(
  function TimeRangePicker(props, ref) {
    const { onChange, value, label, name, error, hidden, className } = props

    const onChangeStartTime = useCallback(
      (newTimeValue: string) => {
        const newValue = {
          ...value,
          start: newTimeValue,
        }
        onChange(newValue)
      },
      [onChange, value]
    )

    const onChangeEndTime = useCallback(
      (newTimeValue: string) => {
        const newValue = {
          ...value,
          end: newTimeValue,
        }
        onChange(newValue)
      },
      [onChange, value]
    )

    if (hidden) return null

    return (
      <div className={classNames(classes.wrapper, className)}>
        <label htmlFor={`${name}.time_range`} className={classes.label}>
          {label}
        </label>
        <div className={classes.innerWrapper}>
          <TimePickerInput
            onChange={onChangeStartTime}
            name={`${name}.start`}
            value={value?.start}
            className={classes.timePicker}
            error={error}
          />
          <span className={classes.line} />
          <TimePickerInput
            onChange={onChangeEndTime}
            name={`${name}.end`}
            value={value?.end}
            className={classes.timePicker}
          />
        </div>
      </div>
    )
  }
)

export default TimeRangePicker
