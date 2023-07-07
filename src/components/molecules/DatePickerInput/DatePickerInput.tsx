import { forwardRef } from 'react'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker'
import { et } from 'date-fns/locale'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import InputWrapper, {
  InputWrapperProps,
} from 'components/molecules/InputWrapper/InputWrapper'
import 'react-datepicker/dist/react-datepicker.css'
import classes from './classes.module.scss'
import { formatDate } from 'helpers'

type DatePickerComponentProps = {
  ariaLabel?: string
  placeholder?: string
  disabled?: boolean
  value?: string
  name: string
  onChange: (value: string) => void
}

export type DatePickerInputProps = DatePickerComponentProps &
  Omit<InputWrapperProps, 'children'>

registerLocale('et-EE', et)

const changeDateToString = (dateObject: Date | null | undefined) =>
  dayjs(dateObject).format('DD/MM/YYYY')

const DatePickerComponent = ({
  name,
  value,
  placeholder,
  disabled,
  ariaLabel,
  onChange,
  ...rest
}: DatePickerComponentProps) => {
  const handleDateChange: ReactDatePickerProps['onChange'] = (value) => {
    return onChange(changeDateToString(value))
  }

  const order = [2, 1, 0]
  const splittedDayValue = formatDate(value || '', '/', '-', order)

  const currentDate = new Date()
  currentDate.setFullYear(currentDate.getFullYear() + 1)
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })

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
        minDate={new Date()}
        maxDate={new Date(formattedDate)}
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
