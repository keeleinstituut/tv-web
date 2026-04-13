import { FC } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { slotIndexToIso, isSlotPast } from 'helpers/calendarSlotUtils'
import classes from 'components/molecules/CalendarLanguageRow/classes.module.scss'

interface Props {
  totalSlots: number
  date: string
  dayStartHour: number
  slotWidth: number
  isSlotBooked: (index: number) => boolean
  isSlotFullyBooked: (index: number) => boolean
}

/**
 * Renders the background pill cells for a calendar day row (past, bookable).
 * Fully-booked slots render as gray (same as past) — no vendor availability info shown.
 * Shared between CalendarLanguageRow and CalendarDayClientBookingRow.
 */
const CalendarSlotCells: FC<Props> = ({
  totalSlots,
  date,
  dayStartHour,
  slotWidth: sw,
  isSlotBooked,
  isSlotFullyBooked,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {Array.from({ length: totalSlots }).map((_, i) => {
        const slotIso = slotIndexToIso(i, date, dayStartHour)
        const isPast = isSlotPast(slotIso)
        const isBooked = isSlotBooked(i)
        const fullyBooked = !isPast && !isBooked && isSlotFullyBooked(i)
        const isBookable = !isPast && !isBooked && !fullyBooked

        if (isBooked) return null

        // Determine visual category: past, fullyBooked (gray), or bookable
        const visualPast = isPast || fullyBooked

        if (i % 2 === 1) {
          const prevBooked = isSlotBooked(i - 1)
          const prevIso = slotIndexToIso(i - 1, date, dayStartHour)
          const prevIsPast = isSlotPast(prevIso)
          const prevFullyBooked =
            !prevIsPast && !prevBooked && isSlotFullyBooked(i - 1)
          const prevVisualPast = prevIsPast || prevFullyBooked
          if (visualPast && !prevBooked && prevVisualPast) return null
          if (isBookable && !prevBooked && !prevIsPast && !prevFullyBooked)
            return null
        }

        const nextSlotIso =
          i + 1 < totalSlots ? slotIndexToIso(i + 1, date, dayStartHour) : null
        const nextBooked = nextSlotIso !== null && isSlotBooked(i + 1)
        const nextIsPast = nextSlotIso !== null && isSlotPast(nextSlotIso!)
        const nextFullyBooked =
          nextSlotIso !== null && !nextIsPast && !nextBooked && isSlotFullyBooked(i + 1)
        const nextVisualPast = nextIsPast || nextFullyBooked
        const nextIsPastUnbooked = visualPast && !nextBooked && nextVisualPast
        const nextIsBookable =
          isBookable &&
          nextSlotIso !== null &&
          !nextIsPast &&
          !nextBooked &&
          !nextFullyBooked
        const isWide = i % 2 === 0 && (nextIsPastUnbooked || nextIsBookable)

        return (
          <div
            key={i}
            className={classNames(classes.slotCell, {
              [classes.slotCellPast]: visualPast,
              [classes.slotCellBookable]: isBookable,
              [classes.slotCellHour]: i % 2 === 0,
            })}
            style={{
              left: i * sw + 4,
              width: isWide ? sw * 2 - 8 : sw - 8,
              top: 4,
              bottom: 4,
              height: 'auto',
            }}
          >
            {isBookable && (
              <span className={classes.slotCellBookableLabel}>
                {isWide ? t('calendar.select_time') : '+'}
              </span>
            )}
          </div>
        )
      })}
    </>
  )
}

export default CalendarSlotCells
