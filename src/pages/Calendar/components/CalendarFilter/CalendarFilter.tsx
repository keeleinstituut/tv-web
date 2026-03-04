import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { Root as FormRoot } from '@radix-ui/react-form'
import CalenderTodayIcon from 'assets/icons/calenderToday.svg?react'
import CalenderWeekIcon from 'assets/icons/calenderWeek.svg?react'
import CalenderMonthIcon from 'assets/icons/calenderMonth.svg?react'
import HorizontalDotsIcon from 'assets/icons/horizontal_dots.svg?react'
import classes from './CalendarFilter.module.scss'
import DateTimePicker from 'components/molecules/DateTimePicker/DateTimePicker'
import SimpleDropdown from 'components/molecules/SimpleDropdown/SimpleDropdown'
import MoreButton from 'pages/Calendar/components/CalendarMoreButton/CalendarMoreButton'

export type CalendarView = 'today' | 'week' | 'month'

interface CalendarFilterProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  role: string
}

const VIEW_OPTIONS: CalendarView[] = ['today', 'week', 'month']

const getViewIcon = (view: CalendarView) => {
  switch (view) {
    case 'today':
      return <CalenderTodayIcon className={classes.segmentIcon} aria-hidden />
    case 'week':
      return <CalenderWeekIcon className={classes.segmentIcon} aria-hidden />
    case 'month':
      return <CalenderMonthIcon className={classes.segmentIcon} aria-hidden />
  }
}
const ViewSelector = ({
  view,
  onViewChange,
}: Pick<CalendarFilterProps, 'view' | 'onViewChange'>) => {
  const { t } = useTranslation()
  return (
    <div
      className={classes.segmentedGroup}
      role="group"
      aria-label={t('label.filter')}
    >
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={classNames(
            classes.segmentButton,
            view === option && classes.segmentButtonActive
          )}
          onClick={() => onViewChange(option)}
          aria-pressed={view === option}
        >
          {getViewIcon(option)}
          <span>{t(`calendar.filter_${option}`)}</span>
        </button>
      ))}
    </div>
  )
}

interface ExpandedFilterProps {
  onApplyFilters: () => void
}

const ExpandedFilter: FC<ExpandedFilterProps> = ({ onApplyFilters }) => {
  const { t } = useTranslation()

  return (
    <div className={classes.expandedFilterWrapper}>
      <div className={classes.expandedFilter}>
        <div className={classes.expandedField}>
          <label className={classes.expandedLabel} htmlFor="calendar-language">
            {t('label.language_direction')}
          </label>
          <SimpleDropdown
            className={classes.expandedSelect}
            label={t('calendar.tellija_select_language')}
            options={[{ label: t('calendar.tellija_select_language') }]}
          />
        </div>
        <div className={classes.expandedField}>
          <label className={classes.expandedLabel} htmlFor="calendar-datetime">
            {t('calendar.tellija_date_time')}
          </label>
          <FormRoot>
            <DateTimePicker
              className={classes.expandedDateTimePicker}
              onChange={() => {}}
              name="calendar-datetime"
            />
          </FormRoot>
        </div>
        <div className={classes.expandedField}>
          <label className={classes.expandedLabel} htmlFor="calendar-duration">
            {t('calendar.tellija_duration')}
          </label>
          <SimpleDropdown
            label={t('calendar.tellija_duration_30min')}
            className={classes.expandedSelect}
            options={[{ label: t('calendar.tellija_duration_30min') }]}
          />
        </div>
      </div>
      <button
        type="button"
        className={classes.applyFiltersButton}
        onClick={onApplyFilters}
        aria-label={t('calendar.tellija_find_suitable_time')}
      >
        {t('calendar.tellija_find_suitable_time')}
      </button>
    </div>
  )
}

const CalendarFilter: FC<CalendarFilterProps> = ({
  view,
  onViewChange,
  role,
}) => {
  const { t } = useTranslation()
  const isTellija = role === 'Tellija'
  const isAdmin = role === 'Admin'
  const isTellijaOrAdmin = isTellija || isAdmin

  const handleApplyFilters = () => {
    // TODO: trigger backend request to apply filters (language, time, duration)
  }

  return (
    <div className={classes.root}>
      <ViewSelector view={view} onViewChange={onViewChange} />
      {isTellijaOrAdmin && (
        <ExpandedFilter onApplyFilters={handleApplyFilters} />
      )}
      <MoreButton
        triggerLabel={t('calendar.filter_more')}
        TriggerIcon={HorizontalDotsIcon}
        triggerClassName={classes.moreButton}
      />
    </div>
  )
}

export default CalendarFilter
