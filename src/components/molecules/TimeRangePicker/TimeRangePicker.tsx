import { FC, SVGProps, forwardRef, useCallback } from 'react'
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
  errorZIndex?: number
  showSeconds?: boolean
  icon?: FC<SVGProps<SVGSVGElement>>
}

const TimeRangePicker = forwardRef<HTMLInputElement, TimeRangePickerProps>(
  function TimeRangePicker(props, ref) {
    const {
      onChange,
      value,
      label,
      name,
      error,
      hidden,
      className,
      errorZIndex,
      showSeconds,
      icon,
    } = props

    const onChangeStartTime = useCallback(
      (newTimeValue: string) => {
        if (!showSeconds && newTimeValue.length === 5) {
          onChange({
            ...value,
            start: `${newTimeValue}:00`,
          })
        } else {
          onChange({
            ...value,
            start: newTimeValue,
          })
        }
      },
      [onChange, value, showSeconds]
    )

    const onChangeEndTime = useCallback(
      (newTimeValue: string) => {
        if (!showSeconds && newTimeValue.length === 5) {
          onChange({
            ...value,
            end: `${newTimeValue}:00`,
          })
        } else {
          onChange({
            ...value,
            end: newTimeValue,
          })
        }
      },
      [onChange, value, showSeconds]
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
            errorZIndex={errorZIndex}
            error={!value?.start || error?.message ? error : undefined}
            showSeconds={showSeconds}
            icon={icon}
          />
          <span className={classes.line} />
          <TimePickerInput
            onChange={onChangeEndTime}
            name={`${name}.end`}
            value={value?.end}
            className={classes.timePicker}
            errorZIndex={errorZIndex}
            error={!value?.end ? error : undefined}
            showSeconds={showSeconds}
            icon={icon}
          />
        </div>
      </div>
    )
  }
)

export default TimeRangePicker
