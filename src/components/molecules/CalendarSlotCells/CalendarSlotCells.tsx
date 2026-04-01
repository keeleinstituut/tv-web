import { FC } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import BookingBusyIcon from 'assets/icons/booking_busy.svg?react'
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
 * Renders the background pill cells for a calendar day row (past, bookable,
 * fully-booked). Shared between CalendarLanguageRow and CalendarDayClientBookingRow.
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

        if (i % 2 === 1) {
          const prevBooked = isSlotBooked(i - 1)
          const prevIso = slotIndexToIso(i - 1, date, dayStartHour)
          const prevIsPast = isSlotPast(prevIso)
          if (isPast && !prevBooked && prevIsPast) return null
          if (isBookable && !prevBooked && !prevIsPast && !isSlotFullyBooked(i - 1))
            return null
          if (fullyBooked && !prevBooked && !prevIsPast && isSlotFullyBooked(i - 1))
            return null
        }

        const isPill = isPast || isBookable || fullyBooked
        const nextSlotIso =
          i + 1 < totalSlots ? slotIndexToIso(i + 1, date, dayStartHour) : null
        const nextIsPastUnbooked =
          isPast && nextSlotIso !== null && isSlotPast(nextSlotIso) && !isSlotBooked(i + 1)
        const nextIsBookable =
          isBookable &&
          nextSlotIso !== null &&
          !isSlotPast(nextSlotIso) &&
          !isSlotBooked(i + 1) &&
          !isSlotFullyBooked(i + 1)
        const nextIsFullyBooked =
          fullyBooked &&
          nextSlotIso !== null &&
          !isSlotPast(nextSlotIso) &&
          !isSlotBooked(i + 1) &&
          isSlotFullyBooked(i + 1)
        const isWide = i % 2 === 0 && (nextIsPastUnbooked || nextIsBookable || nextIsFullyBooked)

        return (
          <div
            key={i}
            className={classNames(classes.slotCell, {
              [classes.slotCellPast]: isPast,
              [classes.slotCellBookable]: isBookable,
              [classes.slotCellFullyBooked]: fullyBooked,
              [classes.slotCellHour]: i % 2 === 0,
            })}
            style={
              isPill
                ? { left: i * sw + 4, width: isWide ? sw * 2 - 8 : sw - 8, top: 4, bottom: 4, height: 'auto' }
                : { left: i * sw, width: sw }
            }
          >
            {isBookable && (
              <span className={classes.slotCellBookableLabel}>
                {isWide ? t('calendar.select_time') : '+'}
              </span>
            )}
            {fullyBooked && (
              <>
                <BookingBusyIcon className={classes.slotCellFullyBookedIcon} />
                {isWide && (
                  <span className={classes.slotCellFullyBookedLabel}>
                    {t('calendar.booked')}
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}
    </>
  )
}

export default CalendarSlotCells
