import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker'
import { Field, Label } from '@radix-ui/react-form'
import dayjs from 'dayjs'
import { et } from 'date-fns/locale'
import InputError from 'components/atoms/InputError/InputError'
import Icon from 'components/atoms/Icon/Icon'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import classNames from 'classnames'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'

export interface DatePickerInputProps {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange: (value: string) => void
}

registerLocale('et-EE', et)

const changeDateToString = (dateObject: Date | null | undefined) =>
  dayjs(dateObject).format('DD/MM/YYYY')

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

    const ariaLabelToUse = ariaLabel || (label as string)

    const handleDateChange: ReactDatePickerProps['onChange'] = (value) => {
      return onChange(changeDateToString(value))
    }

    const splittedValue = value?.split('/')
    const formattedValue =
      splittedValue?.[2] + '-' + splittedValue?.[1] + '-' + splittedValue?.[0]

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
          className={classNames(classes.wrapper, error && classes.errorMessage)}
        >
          <DatePicker
            id="DatePicker"
            selected={value ? new Date(formattedValue) : null}
            dateFormat={'dd.MM.yyyy'}
            locale="et-EE"
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
          <InputError {...error} />
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
