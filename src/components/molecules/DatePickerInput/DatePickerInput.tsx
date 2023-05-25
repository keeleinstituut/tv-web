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
import classes from './styles.module.scss'

type DatePickerComponentProps = {
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
  value?: string
  name: string
  onChange: (value: string) => void
  range?: boolean
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
  range,
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
        id={name}
        selected={value ? new Date(formattedDayValue) : null}
        dateFormat={'dd.MM.yyyy'}
        locale="et-EE"
        placeholderText={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        {...rest}
        onChange={handleDateChange}
      />
      <Calender
        className={classNames(
          disabled && classes.disabledCalender,
          // range ? classes.rangeDateIcon : classes.dateIcon
          classes.dateIcon
        )}
      />
      {/* <div className={classNames(range && classes.dateLine)} /> */}
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
      range,
      onChange,
      ...rest
    } = props

    return (
      <InputWrapper
        label={label}
        name={name}
        className={classNames(
          className
          // range ? classes.rangeDatePickerContainer : classes.datePickerContainer
          // range && classes.rangeDatePickerContainer
        )}
        range={range}
      >
        <div
          className={
            range ? classes.rangeContentContainer : classes.contentContainer
          }
        >
          <div
            className={classNames(
              error && classes.errorMessage,
              // range ? classes.rangeWrapper : classes.wrapper
              classes.wrapper
            )}
          >
            <DatePickerComponent
              name={name}
              value={value}
              disabled={disabled}
              ariaLabel={ariaLabel}
              placeholder={placeholder}
              onChange={onChange}
              {...rest}
            />

            {/* <TimePickerInput
              value={value}
              onChange={onChange}
              disabled={disabled}
              ariaLabel={ariaLabel}
              error={error}
              timePicker={timePicker}
              range={range}
              timePickerLineClass={classes.timePickerLineClass}
            /> */}
          </div>
          <div className={classNames(range && classes.dateLine)} />
        </div>
      </InputWrapper>
    )
  }
)

export default DatePickerInput
