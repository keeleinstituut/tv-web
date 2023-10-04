import DatePickerInput from 'components/molecules/DatePickerInput/DatePickerInput'
import { Ref, forwardRef, useCallback } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes, IconPositioningTypes } from '../Button/Button'

export interface DateRangePickerProps {
  onChange: (value: { start?: string; end?: string }) => void
  value?: { start?: string; end?: string }
  label?: string
  error?: FieldError
  name: string
  hidden?: boolean
  className?: string
  handleDelete?: () => void
}

const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
  function DateRangePicker(props, ref) {
    const {
      onChange,
      value,
      label,
      name,
      error,
      hidden,
      className,
      handleDelete,
    } = props

    const { t } = useTranslation()

    const onChangeStartDate = useCallback(
      (newDateValue: string) => {
        const newValue = {
          ...value,
          start: newDateValue,
        }
        onChange(newValue)
      },
      [onChange, value]
    )

    const onChangeEndDate = useCallback(
      (newDateValue: string) => {
        const newValue = {
          ...value,
          end: newDateValue,
        }
        onChange(newValue)
      },
      [onChange, value]
    )

    const handleOnClick = () => {
      if (handleDelete) {
        handleDelete()
      }
    }

    if (hidden) return null

    return (
      <div className={classNames(classes.wrapper, className)}>
        <label htmlFor={`${name}.date`} className={classes.label}>
          {label}
        </label>
        <div className={classes.innerWrapper}>
          <DatePickerInput
            onChange={onChangeStartDate}
            name={`${name}.start`}
            placeholder={t('placeholder.date')}
            value={value?.start}
            error={error}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
          <span className={classes.line} />
          <DatePickerInput
            onChange={onChangeEndDate}
            name={`${name}.end`}
            placeholder={t('placeholder.date')}
            value={value?.end}
            error={error}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
        </div>
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Delete}
          className={classes.button}
          onClick={handleOnClick}
          hidden={!handleDelete}
        />
      </div>
    )
  }
)

export default DateRangePicker
