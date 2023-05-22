import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker'
import { et } from 'date-fns/locale'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import Icon from 'components/atoms/Icon/Icon'
import InputWrapper from 'components/molecules/InputWrapper/InputWrapper'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'

type SharedDateProps = {
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange: (value: string) => void
}

export type DatePickerInputProps = SharedDateProps & {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
}

export type DatePickerComponentProps = SharedDateProps

registerLocale('et-EE', et)

const changeDateToString = (dateObject: Date | null | undefined) =>
  dayjs(dateObject).format('DD/MM/YYYY')

const DatePickerComponent = ({
  value,
  placeholder,
  disabled,
  ariaLabel,
  onChange,
  ...rest
}: DatePickerComponentProps) => {
  const handleDateChange: ReactDatePickerProps['onChange'] = (value) =>
    onChange(changeDateToString(value))

  const splittedDayValue = value?.split('/')

  const formattedDayValue =
    splittedDayValue?.[2] +
    '-' +
    splittedDayValue?.[1] +
    '-' +
    splittedDayValue?.[0]

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
      onChange,
      ...rest
    } = props

    return (
      <InputWrapper
        label={label}
        name={name}
        error={error}
        className={className}
        ref={ref}
      >
        <DatePickerComponent
          value={value}
          disabled={disabled}
          ariaLabel={ariaLabel}
          placeholder={placeholder}
          onChange={onChange}
          {...rest}
        />
      </InputWrapper>
    )
  }
)

export default DatePickerInput
