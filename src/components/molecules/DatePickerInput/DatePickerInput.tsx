import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker'
import { Field, Label } from '@radix-ui/react-form'
import { et } from 'date-fns/locale'
import classNames from 'classnames'
import dayjs from 'dayjs'
// import { ReactComponent as Clock } from 'assets/icons/clock.svg'
import { ReactComponent as Calender } from 'assets/icons/clock.svg'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'
import Icon from 'components/atoms/Icon/Icon'
import InputError from 'components/atoms/InputError/InputError'
import TimePickerInput from '../TimePickerInput/TimePickerInput'

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
  onChange: (value: string) => void
  showSeconds?: boolean
}

registerLocale('et-EE', et)

const changeDateToString = (
  dateObject: Date | null | undefined,
  timePicker: boolean
) => {
  return timePicker
    ? dayjs(dateObject).format('ss/mm/HH/DD/MM/YYYY')
    : dayjs(dateObject).format('DD/MM/YYYY')
}

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
      showSeconds,
      ...rest
    } = props

    const { onChange } = rest

    const ariaLabelToUse = ariaLabel || (label as string)

    const isWeekday = (date: { getDay: () => number }) => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    }

    const handleDateChange: ReactDatePickerProps['onChange'] = (value) => {
      return timePicker
        ? onChange(changeDateToString(value, true))
        : onChange(changeDateToString(value, false))
    }

    const splittedDayValue = value?.split('/')
    const formattedDayValue =
      splittedDayValue?.[2] +
      '-' +
      splittedDayValue?.[1] +
      '-' +
      splittedDayValue?.[0]

    console.log('value: ', value)

    const splittedTimeValue = value?.split('/')
    const formattedTimeValue =
      splittedTimeValue?.[5] +
      '/' +
      splittedTimeValue?.[4] +
      '/' +
      splittedTimeValue?.[3] +
      '/' +
      splittedTimeValue?.[2] +
      '/' +
      splittedTimeValue?.[1] +
      '/' +
      splittedTimeValue?.[0]

    const dateString2 = formattedTimeValue
    const dateArray = dateString2.split('/')
    const year = parseInt(dateArray[0])
    const month = parseInt(dateArray[1]) - 1
    const day = parseInt(dateArray[2])
    const hour = parseInt(dateArray[3])
    const minute = parseInt(dateArray[4])
    const second = parseInt(dateArray[5])

    const date = new Date(year, month, day, hour, minute, second)

    const selectedTime = value ? new Date(date) : null
    const selectedDay = value ? new Date(formattedDayValue) : null

    const selectedDate = timePicker ? selectedTime : selectedDay

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
            // timePicker && classes.timePicker
          )}
        >
          {!timePicker ? (
            <>
              <DatePicker
                id="DatePicker"
                selected={selectedDate}
                // dateFormat={timePicker ? 'HH:mm:ss' : 'dd.MM.yyyy'}
                dateFormat={'dd.MM.yyyy'}
                locale="et-EE"
                filterDate={isWeekday}
                placeholderText={placeholder}
                aria-label={ariaLabelToUse || ''}
                disabled={disabled}
                // showTimeSelect={timePicker}
                // showTimeSelectOnly={timePicker}
                // timeIntervals={30}
                // timeFormat="HH:mm:ss"
                // showTimeInput={timePicker}
                // customTimeInput={
                //   timePicker && (
                //     <TimeInput
                //       value={''}
                //       onChange={function (value: string): void {
                //         throw new Error('Function not implemented.')
                //       }}
                //       timePicker={timePicker}
                //     />
                //   )
                // }
                {...rest}
                onChange={handleDateChange}
              />
              <Icon
                // icon={timePicker ? Clock : Calender}
                icon={Calender}
                className={classNames(
                  classes.dateIcon,
                  disabled && classes.disabledCalender
                )}
                ariaLabel={ariaLabel}
              />
            </>
          ) : (
            <TimePickerInput value={value} onChange={onChange} />
          )}
          <InputError message={message} />
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
