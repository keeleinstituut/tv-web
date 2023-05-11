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
  range?: boolean
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
  range,
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
          disabled && classes.disabledCalender,
          range ? classes.rangeDateIcon : classes.dateIcon
        )}
        ariaLabel={ariaLabel}
      />
      <div className={range ? classes.dateLine : ''} />
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
      range,
      onChange,
      ...rest
    } = props

    const ariaLabelToUse = ariaLabel || (label as string)

    return (
      <Field
        name={name}
        className={classNames(
          className,
          range ? classes.rangeDatePickerContainer : classes.datePickerContainer
        )}
      >
        <div
          className={
            range ? classes.rangeContentContainer : classes.contentContainer
          }
        >
          <Label
            htmlFor="DatePicker"
            className={classNames(
              classes.label,
              !label && classes.hiddenLabel,
              range ? classes.rangeLabel : classes.label
            )}
          >
            {label}
          </Label>
          <div
            className={classNames(
              message && classes.errorMessage,
              range ? classes.rangeWrapper : classes.wrapper
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
              range={range}
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
              range={range}
              timePickerLineClass={classes.timePickerLineClass}
            />
            <InputError message={message} />
          </div>
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
