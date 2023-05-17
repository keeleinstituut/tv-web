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
import TimePickerInput from 'components/molecules/TimePickerInput/TimePickerInput'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'

type SharedDateProps = {
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
  value?: string
  timePicker?: boolean
  onChange: (value: string) => void
}

export type DatePickerInputProps = SharedDateProps & {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  showSeconds?: boolean
}

export type DatePickerComponentProps = SharedDateProps

registerLocale('et-EE', et)

const changeDateToString = (dateObject: Date | null | undefined) => {
  return dayjs(dateObject).format('DD/MM/YYYY')
}

const DatePickerComponent = ({
  value,
  placeholder,
  disabled,
  timePicker,
  ariaLabel,
  onChange,
  ...rest
}: DatePickerComponentProps) => {
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
        placeholderText={placeholder}
        aria-label={ariaLabel}
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
      />
    </>
  )
}

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput(props, ref) {
    const {
      label,
      name,
      error,
      disabled,
      placeholder,
      className,
      ariaLabel,
      value,
      timePicker,
      showSeconds,
      onChange,
      ...rest
    } = props

    return (
      <Field
        name={name}
        className={classNames(classes.datePickerContainer, className)}
      >
        <div className={classes.contentContainer}>
          <Label
            className={classNames(classes.label, !label && classes.hiddenLabel)}
          >
            {label}
          </Label>
          <div
            className={classNames(
              classes.wrapper,
              error && classes.errorMessage
            )}
          >
            <DatePickerComponent
              value={value}
              disabled={disabled}
              ariaLabel={ariaLabel}
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
            <InputError {...error} />
          </div>
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
