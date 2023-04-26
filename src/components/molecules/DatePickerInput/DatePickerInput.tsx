import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker'
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
  timePicker?: boolean
  // onChange: (value: string) => void
  onChange: ReactDatePickerProps['onChange']
}

registerLocale('et-EE', et)

// const changeDateToString = (dateObject: Date | null | undefined) =>
//   dayjs(dateObject).format('DD/MM/YYYY')

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
      timePicker,
      ...rest
    } = props

    // const { onChange } = rest

    const ariaLabelToUse = ariaLabel || (label as string)

    // const isWeekday = (date: { getDay: () => number }) => {
    //   const day = date.getDay()
    //   return day !== 0 && day !== 6
    // }

    // const handleDateChange: ReactDatePickerProps['onChange'] = (value) => {
    //   return onChange(changeDateToString(value))
    // }

    // const splittedValue = value?.split('/')
    // const formattedValue =
    //   splittedValue?.[2] + '-' + splittedValue?.[1] + '-' + splittedValue?.[0]

    // const selectedDay = value ? new Date(formattedValue) : null
    // const selectedDate = timePicker ? value : selectedDay

    console.log('value: ', value)
    console.log('typeof value: ', typeof value)

    const changeDateToString = (
      dateObject: string | number | Date | dayjs.Dayjs | null | undefined
    ) => dayjs(dateObject).format('ss/mm/HH/DD/MM/YYYY')

    const dateToString = changeDateToString(value)
    console.log('dateToString: ', dateToString)

    const splittedTimeValue = dateToString?.split('/')
    const formattedTimeValue =
      splittedTimeValue?.[5] +
      ',' +
      splittedTimeValue?.[4] +
      ',' +
      splittedTimeValue?.[3] +
      ',' +
      splittedTimeValue?.[2] +
      ',' +
      splittedTimeValue?.[1] +
      ',' +
      splittedTimeValue?.[0]

    console.log('formattedTimeValue: ', formattedTimeValue)

    const selectedTime = new Date(formattedTimeValue)

    console.log('selectedTime: ', selectedTime)

    return (
      <Field
        name={name}
        className={classNames(classes.datePickerContainer, className)}
      >
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
            // selected={value ? new Date(formattedValue) : null}
            selected={new Date()}
            // dateFormat={dateFormat}
            // dateFormat={timePicker ? 'hh:mm:ss' : 'dd.MM.yyyy'}
            dateFormat={'hh:mm:ss'}
            locale="et-EE"
            // filterDate={isWeekday}
            placeholderText={placeholder}
            aria-label={ariaLabelToUse || ''}
            disabled={disabled}
            showTimeSelect={timePicker}
            showTimeSelectOnly={timePicker}
            timeIntervals={15}
            timeFormat="HH:mm:ss"
            timeInputLabel=""
            {...rest}
            // onChange={handleDateChange}
            // onChange={onChange}
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
