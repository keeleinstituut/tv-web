import TimePickerInput from 'components/molecules/TimePickerInput/TimePickerInput'

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
}

const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  function DateTimePicker(props, ref) {
    const { onChange, value, label, name, error, hidden, className } = props

    const { t } = useTranslation()

    const onChangeDate = useCallback(
      (newDateValue: string) => {
        const newValue = {
          ...value,
          date: newDateValue,
        }
        onChange(newValue)
      },
      [onChange, value]
    )

    const onChangeTime = useCallback(
      (newDateValue: string) => {
        const newValue = {
          ...value,
          time: newDateValue,
        }
        onChange(newValue)
      },
      [onChange, value]
    )

    if (hidden) return null

    return (
      <div className={classNames(classes.wrapper, className)}>
        <label htmlFor={`${name}.date`} className={classes.label}>
          {label}
        </label>
        <div className={classes.innerWrapper}>
          <DatePickerInput
            onChange={onChangeDate}
            name={`${name}.date`}
            placeholder={t('placeholder.date')}
            error={error}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
          <TimePickerInput
            onChange={onChangeTime}
            name={`${name}.time`}
            className={classes.timePicker}
            showSeconds
          />
        </div>
      </div>
    )
  }
)

export default DateTimePicker
