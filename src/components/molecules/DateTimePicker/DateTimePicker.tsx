import TimePickerInput from 'components/molecules/TimePickerInput/TimePickerInput'
import DatePickerInput from 'components/molecules/DatePickerInput/DatePickerInput'
import { Ref, forwardRef, useCallback, useEffect, useState } from 'react'
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
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [wasModalOpen, setWasModalOpen] = useState(false)

    const onChangeDate = useCallback(
      (newDateValue: string) => {
        const newValue = {
          ...value,
          date: newDateValue,
        }
        onChange(newValue)
        setWasModalOpen(true)
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
        setWasModalOpen(true)
      },
      [onChange, value]
    )

    useEffect(() => {
      if (onDateTimeChange && wasModalOpen && !isModalOpen) {
        onDateTimeChange({ date: value?.date || '', time: value?.time || '' })
        setWasModalOpen(!wasModalOpen)
      }
    }, [isModalOpen, onDateTimeChange, value, wasModalOpen])

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
            value={value?.date}
            error={error}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
          <TimePickerInput
            onChange={onChangeTime}
            name={`${name}.time`}
            value={value?.time}
            className={classes.timePicker}
            setIsModalOpen={setIsModalOpen}
            disabled={disabled}
            showSeconds
          />
        </div>
      </div>
    )
  }
)

export default DateTimePicker
