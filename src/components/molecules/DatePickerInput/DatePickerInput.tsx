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
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import Icon from 'components/atoms/Icon/Icon'
import InputError from 'components/atoms/InputError/InputError'
import TimePickerInput from '../TimePickerInput/TimePickerInput'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'

export interface DatePickerInputProps {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel?: string
  message?: string
  placeholder?: string
  dateFormat?: string
  disabled?: boolean
  value?: string
  timePicker?: boolean
  onChange: (value: string) => void
  showSeconds?: boolean
}

export interface DatePickerComponentProps extends DatePickerInputProps {
  ariaLabelToUse?: string
}

registerLocale('et-EE', et)

const changeDateToString = (dateObject: Date | null | undefined) => {
  return dayjs(dateObject).format('DD/MM/YYYY')
}

const DatePickerComponent = ({
  value,
  name,
  placeholder,
  ariaLabelToUse,
  disabled,
  ariaLabel,
  timePicker,
  onChange,
  ...rest
}: DatePickerComponentProps) => {
  const isWeekday = (date: { getDay: () => number }) => {
    const day = date.getDay()
    return day !== 0 && day !== 6
  }

  const handleDateChange: ReactDatePickerProps['onChange'] = (value) => {
    return onChange(changeDateToString(value))
  }

  const splittedDayValue = value?.split('/')

  const formattedDayValue =
    splittedDayValue?.[2] +
    '-' +
    splittedDayValue?.[1] +
    '-' +
    splittedDayValue?.[0]

  if (timePicker) return null

  return (
    <>
      <DatePicker
        id="DatePicker"
        selected={value ? new Date(formattedDayValue) : null}
        dateFormat={'dd.MM.yyyy'}
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
        className={classNames(
          classes.dateIcon,
          disabled && classes.disabledCalender
        )}
        ariaLabel={ariaLabel}
      />
    </>
  )
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
      error,
      value,
      timePicker,
      showSeconds,
      onChange,
      ...rest
    } = props

    const ariaLabelToUse = ariaLabel || (label as string)

    return (
      <Field
        name={name}
        className={classNames(classes.datePickerContainer, className)}
      >
        <div className={classes.contentContainer}>
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
            <DatePickerComponent
              value={value}
              disabled={disabled}
              ariaLabel={ariaLabel}
              ariaLabelToUse={ariaLabelToUse}
              name={name}
              placeholder={placeholder}
              timePicker={timePicker}
              onChange={onChange}
              {...rest}
            />
            <TimePickerInput
              value={value}
              onChange={onChange}
              disabled={disabled}
              ariaLabel={ariaLabel}
              error={error}
              showSeconds={showSeconds}
              timePicker={timePicker}
            />
            <InputError message={message} />
          </div>
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
