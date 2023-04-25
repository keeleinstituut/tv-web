import { SyntheticEvent, forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, { registerLocale } from 'react-datepicker'
import { Field, Label } from '@radix-ui/react-form'
import { et } from 'date-fns/locale'
import InputError from 'components/atoms/InputError/InputError'
import Icon from 'components/atoms/Icon/Icon'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import classNames from 'classnames'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'
import dayjs from 'dayjs'

export interface DatePickerInputProps {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  message?: string
  placeholder?: string
  dateFormat?: string
  disabled?: boolean
  value?: string
  // onChange: ReactDatePickerProps['onChange']
  onChange: (value: string) => void
}

registerLocale('et-EE', et)

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput(props, ref) {
    const {
      label,
      name,
      disabled,
      placeholder,
      dateFormat,
      className,
      ariaLabel,
      message,
      value,
      ...rest
    } = props

    const { onChange } = rest

    const isWeekday = (date: { getDay: () => number }) => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    }

    const ariaLabelToUse = ariaLabel || (label as string)

    const changeValueToString = (value: any) => {
      const formatDateValue = dayjs(value).format('dd/mm/yyyy')

      console.log('formatDateValue value: ', value)
      return formatDateValue
    }
    // console.log('changeValueToString(value): ', changeValueToString(value))

    const selectedValue = value ? new Date(value) : null

    const handleDateChange = (
      value: Date | null,
      event: SyntheticEvent<any, Event> | undefined
    ) => {
      const stringValue = changeValueToString(value)
      console.log('handleDateChange value: ', value)
      console.log('stringValue: ', stringValue)
      return onChange(stringValue)
    }

    return (
      <Field name={name} className={classes.datePickerContainer}>
        <Label
          htmlFor="DatePicker"
          className={classNames(classes.label, !label && classes.hiddenLabel)}
        >
          {label}
        </Label>
        <div
          className={classNames(
            classes.wrapper,
            message && classes.errorMessage
          )}
        >
          <DatePicker
            id="DatePicker"
            selected={selectedValue}
            dateFormat={dateFormat}
            locale="et-EE"
            filterDate={isWeekday}
            placeholderText={placeholder}
            aria-label={ariaLabelToUse || ''}
            disabled={disabled}
            {...rest}
            onChange={handleDateChange}
          />
          <Icon
            icon={Calender}
            className={classNames(disabled && classes.disabledCalender)}
            ariaLabel={ariaLabel}
          />
          <InputError message={message} />
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
