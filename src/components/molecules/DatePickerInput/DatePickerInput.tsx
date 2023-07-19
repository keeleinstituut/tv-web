import { forwardRef } from 'react'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker'
import { et } from 'date-fns/locale'
import classNames from 'classnames'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import InputWrapper, {
  InputWrapperProps,
} from 'components/molecules/InputWrapper/InputWrapper'
import 'react-datepicker/dist/react-datepicker.css'
import classes from './classes.module.scss'

type DatePickerComponentProps = {
  ariaLabel?: string
  placeholder?: string
  disabled?: boolean
  value?: string
  name: string
  onChange: (value: string) => void
  minDate?: Date
  maxDate?: Date
}

export type DatePickerInputProps = DatePickerComponentProps &
  Omit<InputWrapperProps, 'children'>

registerLocale('et-EE', et)
dayjs.extend(customParseFormat)

const changeDateToString = (dateObject: Date | null | undefined) =>
  dayjs(dateObject).format('DD/MM/YYYY')

const DatePickerComponent = ({
  name,
  value,
  placeholder,
  disabled,
  ariaLabel,
  onChange,
  minDate,
  maxDate,
  ...rest
}: DatePickerComponentProps) => {
  const handleDateChange: ReactDatePickerProps['onChange'] = (value) =>
    onChange(changeDateToString(value))

  const convertedValue = dayjs(value, 'DD/MM/YYYY')
  const splittedDayValue = convertedValue?.format('YYYY-MM-DD')

  return (
    <>
      <DatePicker
        id={name}
        selected={value ? new Date(splittedDayValue) : null}
        dateFormat={'dd.MM.yyyy'}
        locale="et-EE"
        placeholderText={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        minDate={minDate ? minDate : null}
        maxDate={maxDate ? maxDate : null}
        {...rest}
        onChange={handleDateChange}
      />
      <Calender
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
    const { label, name, error, className, errorZIndex, ...rest } = props

    return (
      <InputWrapper
        label={label}
        name={name}
        error={error}
        className={className}
        errorZIndex={errorZIndex}
        ref={ref}
        wrapperClass={classes.datePickerWrapper}
      >
        <DatePickerComponent name={name} {...rest} />
      </InputWrapper>
    )
  }
)

export default DatePickerInput
