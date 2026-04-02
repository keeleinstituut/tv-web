import CalendarTimeSelect from 'components/molecules/CalendarTimeSelect/CalendarTimeSelect'
import DatePickerInput from 'components/molecules/DatePickerInput/DatePickerInput'
import { Ref, forwardRef, useCallback } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'

export interface DateTimePickerProps {
  onChange: (value: { date?: string; time?: string }) => void
  value?: { date?: string; time?: string }
  label?: string
  error?: FieldError
  name: string
  hidden?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
  onDateTimeChange?: (value: { date: string; time: string }) => void
  disabled?: boolean
}

const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  function DateTimePicker(props, ref) {
    const {
      onChange,
      value,
      label,
      name,
      error,
      hidden,
      className,
      minDate,
      maxDate,
      onDateTimeChange,
      disabled,
    } = props

    const { t } = useTranslation()

    const onChangeDate = useCallback(
      (newDateValue: string) => {
        const newValue = { ...value, date: newDateValue }
        onChange(newValue)
        onDateTimeChange?.({ date: newDateValue, time: value?.time || '' })
      },
      [onChange, onDateTimeChange, value]
    )

    const onChangeTime = useCallback(
      (newTimeValue: string) => {
        const newValue = { ...value, time: newTimeValue }
        onChange(newValue)
        onDateTimeChange?.({ date: value?.date || '', time: newTimeValue })
      },
      [onChange, onDateTimeChange, value]
    )

    if (hidden) return null

    return (
      <div className={classNames(classes.wrapper, className)}>
        <label htmlFor={`${name}.date`} className={classes.label}>
          {label}
        </label>
        <div className={classes.innerWrapper}>
          <DatePickerInput
            ariaLabel={t('label.date')}
            onChange={onChangeDate}
            name={`${name}.date`}
            placeholder={t('placeholder.date')}
            value={value?.date}
            error={error}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            ref={ref as unknown as Ref<HTMLInputElement>}
            className={classes.datePickerContainer}
          />
          <div className={classes.timeSelectWrapper}>
            <CalendarTimeSelect
              value={value?.time ?? ''}
              onChange={onChangeTime}
              disabled={disabled}
              id={`${name}.time`}
              aria-label={t('label.time')}
              className={classes.timeSelectTrigger}
            />
          </div>
        </div>
      </div>
    )
  }
)

export default DateTimePicker
