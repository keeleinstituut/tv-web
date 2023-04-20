import { forwardRef, useId } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { et } from 'date-fns/locale'
import { ControllerRenderProps } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'
import Icon from 'components/atoms/Icon/Icon'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'
import classNames from 'classnames'

import 'react-datepicker/dist/react-datepicker.css'
import classes from './styles.module.scss'

type DatePickerProps = ControllerRenderProps & {
  label?: string
  name?: string
  hideLabel?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  ariaLabel?: string
  message?: string
  selected?: Date
}

registerLocale('et-EE', et)

const DatePickerInput = forwardRef<any, DatePickerProps>(
  (
    {
      label,
      name,
      hideLabel,
      disabled,
      placeholder,
      className,
      ariaLabel,
      message,
      selected,
      onChange,
      ...rest
    },
    ref
  ) => {
    const id = useId()

    const isWeekday = (date: { getDay: () => any }) => {
      const day = date.getDay()
      return day !== 0 && day !== 6
    }

    return (
      <div className={classes.datePickerContainer}>
        <div>
          {label && !hideLabel && (
            <label htmlFor={id} className={classes.label}>
              {label}
            </label>
          )}
          <div className={classes.wrapper}>
            <DatePicker
              selected={selected}
              dateFormat={'dd.MM.yyyy'}
              locale="et-EE"
              filterDate={isWeekday}
              placeholderText={placeholder}
              aria-label={hideLabel ? label : undefined}
              disabled={disabled}
              {...rest}
              onChange={onChange}
            />
            <Icon
              icon={Calender}
              className={classNames(
                disabled ? classes.disabledCalender : '',
                className
              )}
              ariaLabel={ariaLabel}
            />
            <InputError message={message} />
          </div>
        </div>
      </div>
    )
  }
)

export default DatePickerInput
