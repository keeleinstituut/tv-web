import { forwardRef, useCallback } from 'react'
import { FieldError, Path } from 'react-hook-form'
import classNames from 'classnames'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import TimeRangePicker from 'components/molecules/TimeRangePicker/TimeRangePicker'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { map, toArray } from 'lodash'
import { DayTypes } from 'types/institutions'

export interface DayTimeRangePickerProps {
  onChange: (value: {
    days?: string[]
    time_range?: { start?: string; end?: string }
  }) => void
  value?: { days?: string[]; time_range?: { start?: string; end?: string } }
  label?: string
  error?: FieldError
  name: string
  hidden?: boolean
  className?: string
  handleDelete?: () => void
}

const DayTimeRangePicker = forwardRef<
  HTMLInputElement,
  DayTimeRangePickerProps
>(function DateTimePicker(props, ref) {
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

  const onChangeDay = useCallback(
    (newDayValue: string | string[]) => {
      const newValue = {
        ...value,
        days: toArray(newDayValue),
      }
      onChange(newValue)
    },
    [onChange, value]
  )

  const onChangeTime = useCallback(
    (timeRangeValue: { start?: string; end?: string }) => {
      const newValue = {
        ...value,
        time_range: timeRangeValue,
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

  const daysOption = map(DayTypes, (day) => {
    return {
      label: t(`institution.days.${day}`),
      value: day,
    }
  })

  if (hidden) return null

  return (
    <div className={classNames(classes.wrapper, className)}>
      <label htmlFor={`${name}.date`} className={classes.label}>
        {label}
      </label>
      <div className={classes.innerWrapper}>
        <SelectionControlsInput
          ariaLabel={t('institution.working_days')}
          label={t('institution.working_days')}
          placeholder={t('placeholder.pick_days')}
          name={`${name}.days`}
          options={daysOption}
          value={value?.days}
          onChange={onChangeDay}
          multiple={true}
          buttons={true}
          usePortal={true}
          error={error}
        />
        <TimeRangePicker
          onChange={onChangeTime}
          name={`${name}.time_range`}
          value={value?.time_range as Path<unknown>}
          label={t('institution.working_times')}
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
})

export default DayTimeRangePicker
