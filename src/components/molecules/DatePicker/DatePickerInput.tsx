import { forwardRef, useId } from 'react'
import DatePicker from 'react-datepicker'
import { ControllerRenderProps } from 'react-hook-form'
// import { MdChevronRight, MdChevronLeft } from 'react-icons/md'
// import classNames from 'classnames'
import InputError from 'components/atoms/InputError/InputError'
import classes from './styles.module.scss'
import Icon from 'components/atoms/Icon/Icon'
import { ReactComponent as Arrow } from 'assets/icons/arrow.svg'
import { ReactComponent as Calender } from 'assets/icons/calender.svg'

type DatePickerProps = ControllerRenderProps & {
  label: string
  name: string
  hideLabel?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  ariaLabel?: string
  message?: string
}

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
      ...rest
    },
    ref
  ) => {
    const id = useId()
    const { value, onChange } = rest

    return (
      <div className={classes.datepicker}>
        <div>
          {label && !hideLabel && (
            <label htmlFor={id} className={classes.label}>
              {label}
            </label>
          )}
          <div className={classes.wrapper}>
            <DatePicker
              selected={new Date(value)}
              dateFormat={'dd.MM.yyyy'}
              // locale="et-EE"
              placeholderText={placeholder}
              // previousMonthButtonLabel={<MdChevronLeft />}
              // nextMonthButtonLabel={<MdChevronRight />}
              aria-label={hideLabel ? label : undefined}
              // portalId="overlay-root"
              // {...rest}
              onChange={onChange}
            />
            <Icon icon={Calender} className={className} ariaLabel={ariaLabel} />
            <InputError message={message} />
          </div>
          <Icon icon={Arrow} className={className} ariaLabel={ariaLabel} />
        </div>
      </div>
    )
  }
)

export default DatePickerInput
