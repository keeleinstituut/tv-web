import { InputHTMLAttributes, forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import DatePicker, { registerLocale } from 'react-datepicker'
import { Field, Label, Control } from '@radix-ui/react-form'
import { et } from 'date-fns/locale'
// import { ControllerRenderProps } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import Icon from 'components/atoms/Icon/Icon'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import classNames from 'classnames'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'

// export type DatePickerInputProps = ControllerRenderProps & {
//   name?: string
//   disabled?: boolean
//   placeholder?: string
//   className?: string
//   message?: string
//   selected?: Date
//   value?: Date
//   label?: JSX.Element | string
//   ariaLabel: string
// }

export interface DatePickerInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'label' | 'placeholder' | 'value'
  > {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  message?: string
  // selected?: Date
  value?: string | undefined
  placeholder?: string
}

registerLocale('et-EE', et)

const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function TextInput(props, ref) {
    const {
      label,
      name,
      disabled,
      placeholder,
      className,
      ariaLabel,
      message,
      // selected,
      value,
      ...rest
    } = props

    const isWeekday = (date: { getDay: () => number }) => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    }

    const ariaLabelToUse = ariaLabel || (label as string)

    return (
      <Field name={name} className={classes.datePickerContainer}>
        <Label
          htmlFor="DatePicker"
          className={classNames(
            classes.label,
            !label && classes.hiddenLabel,
            className
          )}
        >
          {label}
        </Label>
        <div
          className={classNames(
            classes.wrapper,
            message && classes.errorMessage,
            className
          )}
        >
          <Control asChild>
            <DatePicker
              id="DatePicker"
              value={value}
              // selected={selected}
              dateFormat={'dd.MM.yyyy'}
              locale="et-EE"
              filterDate={isWeekday}
              placeholderText={placeholder}
              aria-label={ariaLabelToUse || ''}
              disabled={disabled}
              {...rest}
              onChange={(date: Date) => {
                console.log(date)
              }}
              onSelect={(date, event) => {
                // handle date selection here
              }}
            />
          </Control>
          <Icon
            icon={Calender}
            className={classNames(
              disabled && classes.disabledCalender,
              className
            )}
            ariaLabel={ariaLabel}
          />
          <InputError message={message} />
        </div>
      </Field>
    )
  }
)

export default DatePickerInput
