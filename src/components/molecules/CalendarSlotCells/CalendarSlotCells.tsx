import { FC, Fragment } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import {
  slotIndexToIso,
  isSlotPast,
  timeToX,
  durationToWidth,
  blockInnerWidth,
} from 'helpers/calendarSlotUtils'
import {
  clipIntervals,
  extendToStretchEnd,
  validBookingStartsInInterval,
  TimeInterval,
} from 'helpers/calendarDayOverlaps'
import classes from 'components/molecules/CalendarLanguageRow/classes.module.scss'

interface Props {
  totalSlots: number
  date: string
  dayStartHour: number
  slotWidth: number
  isSlotBooked: (index: number) => boolean
  isSlotFullyBooked: (index: number) => boolean
  /** The row's truly free time (availability minus busy); enables gap rendering. */
  freeIntervals?: TimeInterval[]
  /**
   * Click on a green gap: book starting at the gap. The interval is extended
   * to the end of the continuous free stretch, not capped at the cell edge.
   */
  onGapClick?: (freeInterval: TimeInterval) => void
}

/**
 * Renders the background pill cells for a calendar day row (past, bookable).
 * Fully-booked slots render as gray (same as past) — no vendor availability info shown.
 * When freeIntervals are provided: cells fully covered by free time render as the
 * classic green cells; cells only partially free render their bookable remainder
 * as small green clickable gaps on a gray base.
 * Shared between CalendarLanguageRow and CalendarDayClientBookingRow.
 */
const CalendarSlotCells: FC<Props> = ({
  totalSlots,
  date,
  dayStartHour,
  slotWidth: sw,
  isSlotBooked,
  isSlotFullyBooked,
  freeIntervals,
  onGapClick,
}) => {
  const { t } = useTranslation()
  const gapsEnabled = !!freeIntervals && !!onGapClick

  const cellBounds = (i: number): [string, string] => [
    slotIndexToIso(i, date, dayStartHour),
    slotIndexToIso(i + 1, date, dayStartHour),
  ]

  const freeAt = (i: number): TimeInterval[] => {
    if (!gapsEnabled) return []
    const [cellStart, cellEnd] = cellBounds(i)
    return clipIntervals(freeIntervals!, cellStart, cellEnd)
  }

  const fullyAvailAt = (i: number): boolean => {
    const [cellStart, cellEnd] = cellBounds(i)
    const start = new Date(cellStart).getTime()
    const end = new Date(cellEnd).getTime()
    return freeIntervals!.some(
      (f) =>
        new Date(f.start_at).getTime() <= start &&
        new Date(f.end_at).getTime() >= end
    )
  }

  const pastAt = (i: number) =>
    isSlotPast(slotIndexToIso(i, date, dayStartHour))
  const fullyBookedAt = (i: number) =>
    !pastAt(i) && !isSlotBooked(i) && isSlotFullyBooked(i)
  const partialAt = (i: number) =>
    gapsEnabled &&
    !pastAt(i) &&
    !isSlotBooked(i) &&
    !fullyBookedAt(i) &&
    !fullyAvailAt(i)
  const bookableAt = (i: number) =>
    !pastAt(i) && !isSlotBooked(i) && !fullyBookedAt(i) && !partialAt(i)
  const visualPastAt = (i: number) => pastAt(i) || fullyBookedAt(i)

  const renderGaps = (free: TimeInterval[]) =>
    free.map((f) => {
      const starts = validBookingStartsInInterval(f.start_at, f.end_at)
      if (!starts.length) return null
      const left = timeToX(starts[0], dayStartHour, sw) + 4
      const width = blockInnerWidth(durationToWidth(starts[0], f.end_at, sw))
      return (
        <div
          key={`gap-${f.start_at}`}
          className={classNames(
            classes.slotCell,
            classes.slotCellBookable,
            classes.slotCellGap
          )}
          style={{ left, width, top: 4, bottom: 4, height: 'auto' }}
          onClick={(e) => {
            e.stopPropagation()
            onGapClick?.(extendToStretchEnd(f, freeIntervals!))
          }}
        >
          <span className={classes.slotCellBookableLabel}>+</span>
        </div>
      )
    })

  return (
    <>
      {Array.from({ length: totalSlots }).map((_, i) => {
        const isPast = pastAt(i)
        const isBooked = isSlotBooked(i)

        // Booked cells render no background; a partially booked cell still
        // exposes its bookable remainder as gap(s).
        if (isBooked) {
          if (!gapsEnabled || isPast) return null
          const gaps = renderGaps(freeAt(i)).filter(Boolean)
          return gaps.length ? <Fragment key={i}>{gaps}</Fragment> : null
        }

        // Availability edge inside the cell: gray base + bookable gap(s).
        if (partialAt(i)) {
          return (
            <Fragment key={i}>
              <div
                className={classNames(classes.slotCell, classes.slotCellPast, {
                  [classes.slotCellHour]: i % 2 === 0,
                })}
                style={{
                  left: i * sw + 4,
                  width: sw - 8,
                  top: 4,
                  bottom: 4,
                  height: 'auto',
                }}
              />
              {renderGaps(freeAt(i))}
            </Fragment>
          )
        }

        const fullyBooked = fullyBookedAt(i)
        const isBookable = bookableAt(i)

        // Determine visual category: past, fullyBooked (gray), or bookable
        const visualPast = isPast || fullyBooked

        if (i % 2 === 1) {
          const prevBooked = isSlotBooked(i - 1)
          if (visualPast && !prevBooked && visualPastAt(i - 1)) return null
          if (isBookable && !prevBooked && bookableAt(i - 1)) return null
        }

        const hasNext = i + 1 < totalSlots
        const nextBooked = hasNext && isSlotBooked(i + 1)
        const nextIsPastUnbooked =
          visualPast && hasNext && !nextBooked && visualPastAt(i + 1)
        const nextIsBookable =
          isBookable && hasNext && !nextBooked && bookableAt(i + 1)
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
