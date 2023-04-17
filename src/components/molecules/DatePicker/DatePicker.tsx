import { forwardRef, useId } from 'react'
// import ReactDatePicker from 'react-datepicker'
import ReactDatePicker from 'react-datepicker'
import { ControllerRenderProps } from 'react-hook-form'
// import { MdChevronRight, MdChevronLeft } from 'react-icons/md'

type DatePickerProps = ControllerRenderProps & {
  label: string
  name: string
  hideLabel?: boolean
  disabled?: boolean
  placeholder?: string
  timePicker?: boolean
}

const DatePicker = forwardRef<any, DatePickerProps>(
  (
    { label, name, hideLabel, disabled, placeholder, timePicker, ...rest },
    ref
  ) => {
    const id = useId()
    const { value, onChange } = rest

    // const datepickerClasses = clsx(
    //   'datepicker',
    //   disabled && 'datepicker--disabled'
    // )

    return (
      //   <div className={datepickerClasses}>
      <div>
        {label && !hideLabel && (
          <label htmlFor={id} className="datepicker__label">
            {label}
          </label>
        )}
        <div className="datepicker__wrapper">
          <ReactDatePicker
            selected={new Date(value)}
            dateFormat={timePicker ? 'hh:mm:ss' : 'dd.MM.yyyy'}
            locale="et-EE"
            placeholderText={placeholder}
            // previousMonthButtonLabel={<MdChevronLeft />}
            // nextMonthButtonLabel={<MdChevronRight />}
            aria-label={hideLabel ? label : undefined}
            showTimeSelect={timePicker}
            showTimeSelectOnly={timePicker}
            timeIntervals={15}
            timeFormat="hh:mm:ss"
            timeInputLabel=""
            portalId="overlay-root"
            {...rest}
            onChange={onChange}
          />
          {/* <Icon
            icon={
              timePicker ? (
                <MdOutlineSchedule color="#5D6071" fontSize={20} />
              ) : (
                <MdOutlineToday color="#5D6071" fontSize={20} />
              )
            }
            size="medium"
          /> */}
        </div>
      </div>
    )
  }
)

export default DatePicker
