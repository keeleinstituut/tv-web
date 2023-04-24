import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, {
  registerLocale,
  ReactDatePickerProps,
} from 'react-datepicker'
import { Field, Label } from '@radix-ui/react-form'
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
  message?: string
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange: ReactDatePickerProps['onChange']
}

registerLocale('et-EE', et)

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput(props) {
    const {
      label,
      name,
      disabled,
      placeholder,
      className,
      ariaLabel,
      message,
      value,
      ...rest
    } = props

    const isWeekday = (date: { getDay: () => number }) => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    }

    const ariaLabelToUse = ariaLabel || (label as string)

    console.log('value: ', value)
    console.log('value type of: ', typeof value)

    const temp = new Date()

    return (
      <Field name={name} className={classes.datePickerContainer}>
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
            selected={temp}
            // dateFormat={'dd.MM.yyyy'}
            locale="et-EE"
            filterDate={isWeekday}
            placeholderText={placeholder}
            aria-label={ariaLabelToUse || ''}
            disabled={disabled}
            {...rest}
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
