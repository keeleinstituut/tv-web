import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import ArrowRightIcon from 'assets/icons/arrow_right.svg?react'
import classes from './CalendarNavRow.module.scss'

export type CalendarNavRowVariant = 'month' | 'day'

export interface CalendarNavRowMonthProps {
  variant: 'month'
  monthLabel: string
  onPrevious: () => void
  onNext: () => void
}

export interface CalendarNavRowDayProps {
  variant: 'day'
  weekdayLetter: string
  dateLabel: string
  onPrevious: () => void
  onNext: () => void
}

export type CalendarNavRowProps =
  | CalendarNavRowMonthProps
  | CalendarNavRowDayProps

export const CalendarNavRow: FC<CalendarNavRowProps> = (props) => {
  const { onPrevious, onNext } = props
  const { t } = useTranslation()

  const isMonth = props.variant === 'month'

  const ariaLabel = isMonth
    ? t('calendar.month_navigation')
    : t('calendar.day_navigation')
  const prevAriaLabel = isMonth
    ? t('calendar.previous_month')
    : t('calendar.previous_day')
  const nextAriaLabel = isMonth
    ? t('calendar.next_month')
    : t('calendar.next_day')

  return (
    <nav className={classes.root} role="region" aria-label={ariaLabel}>
      <div className={classes.left}>
        <button
          type="button"
          className={classes.prevButton}
          onClick={onPrevious}
          aria-label={prevAriaLabel}
        >
          <ArrowRightIcon className={classes.prevIcon} aria-hidden />
        </button>
        <div className={classes.content}>
          {isMonth ? (
            <span className={classes.monthLabel}>{props.monthLabel}</span>
          ) : (
            <div className={classes.dayContent}>
              <span className={classes.weekdayLetter}>
                {props.weekdayLetter}
              </span>
              <span className={classes.dateLabel}>{props.dateLabel}</span>
            </div>
          )}
        </div>
      </div>
      <div className={classes.right}>
        <button
          type="button"
          className={classes.nextButton}
          onClick={onNext}
          aria-label={nextAriaLabel}
        >
          <ArrowRightIcon className={classes.nextIcon} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
