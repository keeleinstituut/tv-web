import { FC, useCallback, useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import BookingBusyIcon from 'assets/icons/booking_busy.svg?react'
import {
  BookedSlotBlock,
  slotIndexToIso,
  isSlotPast,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import langClasses from 'components/molecules/CalendarLanguageRow/classes.module.scss'
import { useDragSelection } from 'hooks/useDragSelection'
import type { BookedSlot, CalendarLanguage } from 'types/calendar'

interface Props {
  language: CalendarLanguage
  date: string
  dayStartHour: number
  dayEndHour: number
  slotWidth: number
  /** The single booking rendered on this track */
  rowSlot: BookedSlot
  /** All bookings for the language (for blocking drag / cell state) */
  allBookedSlots: BookedSlot[]
  langAvailSlots?: Array<{ start_at: string; end_at: string }>
  onSelectRange?: (langId: string, startIso: string, endIso: string) => void
  onClickSlot?: (slot: BookedSlot) => void
}

const CalendarDayClientBookingRow: FC<Props> = ({
  language,
  date,
  dayStartHour,
  dayEndHour,
  slotWidth: sw,
  rowSlot,
  allBookedSlots,
  langAvailSlots,
  onSelectRange,
  onClickSlot,
}) => {
  const { t } = useTranslation()
  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * sw
  const rowRef = useRef<HTMLDivElement>(null)

  const isSlotBooked = useCallback(
    (slotIndex: number): boolean => {
      const slotStart = slotIndexToIso(slotIndex, date, dayStartHour)
      const slotEnd = slotIndexToIso(slotIndex + 1, date, dayStartHour)
      return allBookedSlots.some(
        (s) =>
          dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
          dayjs(s.end_at).isAfter(dayjs(slotStart))
      )
    },
    [allBookedSlots, date, dayStartHour]
  )

  const isSlotFullyBooked = useCallback(
    (slotIndex: number): boolean => {
      if (!langAvailSlots) return false
      const slotStart = dayjs(slotIndexToIso(slotIndex, date, dayStartHour))
      const slotEnd = dayjs(slotIndexToIso(slotIndex + 1, date, dayStartHour))
      return !langAvailSlots.some(
        (a) =>
          dayjs(a.start_at).isBefore(slotEnd) &&
          dayjs(a.end_at).isAfter(slotStart)
      )
    },
    [langAvailSlots, date, dayStartHour]
  )

  const {
    isDragging,
    selectionLeft,
    selectionWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDragSelection({
    rowRef,
    date,
    dayStartHour,
    totalSlots,
    slotWidth: sw,
    isSlotBooked,
    isSlotFullyBooked,
    onDragComplete: (startIso, endIso) =>
      onSelectRange?.(language.language.id, startIso, endIso),
  })

  const pillCells = useMemo(() => {
    const cells: JSX.Element[] = []
    for (let i = 0; i < totalSlots; i++) {
      const slotIso = slotIndexToIso(i, date, dayStartHour)
      const isPast = isSlotPast(slotIso)
      const isBooked = isSlotBooked(i)
      const fullyBooked = !isPast && !isBooked && isSlotFullyBooked(i)
      const isBookable = !isPast && !isBooked && !fullyBooked

      if (isBooked) continue

      if (i % 2 === 1) {
        const prevBooked = isSlotBooked(i - 1)
        const prevIso = slotIndexToIso(i - 1, date, dayStartHour)
        const prevIsPast = isSlotPast(prevIso)
        if (isPast && !prevBooked && prevIsPast) continue
        if (
          isBookable &&
          !prevBooked &&
          !prevIsPast &&
          !isSlotFullyBooked(i - 1)
        )
          continue
        if (
          fullyBooked &&
          !prevBooked &&
          !prevIsPast &&
          isSlotFullyBooked(i - 1)
        )
          continue
      }

      const isPill = isPast || isBookable || fullyBooked
      const nextSlotIso =
        i + 1 < totalSlots
          ? slotIndexToIso(i + 1, date, dayStartHour)
          : null
      const nextIsPastUnbooked =
        isPast &&
        nextSlotIso !== null &&
        isSlotPast(nextSlotIso) &&
        !isSlotBooked(i + 1)
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
      const isWide =
        i % 2 === 0 &&
        (nextIsPastUnbooked || nextIsBookable || nextIsFullyBooked)

      cells.push(
        <div
          key={i}
          className={classNames(langClasses.slotCell, {
            [langClasses.slotCellPast]: isPast,
            [langClasses.slotCellBookable]: isBookable,
            [langClasses.slotCellFullyBooked]: fullyBooked,
            [langClasses.slotCellHour]: i % 2 === 0,
          })}
          style={
            isPill
              ? {
                  left: i * sw + 4,
                  width: isWide ? sw * 2 - 8 : sw - 8,
                  top: 4,
                  bottom: 4,
                  height: 'auto',
                }
              : { left: i * sw, width: sw }
          }
        >
          {isBookable && (
            <span className={langClasses.slotCellBookableLabel}>
              {isWide ? t('calendar.select_time') : '+'}
            </span>
          )}
          {fullyBooked && (
            <>
              <BookingBusyIcon
                className={langClasses.slotCellFullyBookedIcon}
              />
              {isWide && (
                <span className={langClasses.slotCellFullyBookedLabel}>
                  {t('calendar.booked')}
                </span>
              )}
            </>
          )}
        </div>
      )
    }
    return cells
  }, [
    totalSlots,
    date,
    dayStartHour,
    sw,
    isSlotBooked,
    isSlotFullyBooked,
    t,
  ])

  return (
    <div className={langClasses.rowWrapper}>
      <div className={langClasses.label}>
        <span className={langClasses.badge}>
          {language.language.value.split('-')[0]}
        </span>
      </div>
      <div
        ref={rowRef}
        className={langClasses.slotArea}
        style={{ width: totalWidth }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {pillCells}
        {isDragging && (
          <div
            className={langClasses.selectionHighlight}
            style={{ left: selectionLeft, width: selectionWidth }}
          />
        )}
        <BookedSlotBlock
          slot={rowSlot}
          dayStartHour={dayStartHour}
          onClick={onClickSlot}
          alwaysLightBlue={false}
          slotWidth={sw}
          rowWidth={totalWidth}
        />
      </div>
    </div>
  )
}

export default CalendarDayClientBookingRow
