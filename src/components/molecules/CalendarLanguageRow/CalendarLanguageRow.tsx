import { FC, useCallback, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import BookingUpcomingIcon from 'assets/icons/booking_upcoming.svg?react'
import BookingPastIcon from 'assets/icons/booking_past.svg?react'
import BookingBusyIcon from 'assets/icons/booking_busy.svg?react'
import PinIcon from 'assets/icons/pin.svg?react'
import SmallArrowIcon from 'assets/icons/small_arrow.svg?react'
import { formatDuration } from 'helpers/calendar'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import {
  useFetchCalendarDay,
  useFetchCalendarWeek,
} from 'hooks/requests/useCalendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useDragSelection } from 'hooks/useDragSelection'
import classes from './classes.module.scss'

export const SLOT_WIDTH_PX = 48 // px per 30 min
export const ROW_HEIGHT_PX = 40
export const LABEL_WIDTH_PX = 64

interface Props {
  language: CalendarLanguage
  date: string // YYYY-MM-DD
  dayStartHour: number
  dayEndHour: number
  onSelectRange?: (langId: string, startIso: string, endIso: string) => void
  onClickSlot?: (slot: BookedSlot) => void
  onTogglePin?: () => void
  onToggleExpand?: () => void
  isExpanded?: boolean
  /** When true the row is a header-only strip: no slot cells, no interaction */
  readOnly?: boolean
  slotWidth?: number
}

export function timeToX(
  isoTime: string,
  dayStartHour: number,
  slotWidthPx = SLOT_WIDTH_PX
): number {
  const t = dayjs(isoTime)
  const hoursFromStart = t.hour() + t.minute() / 60 - dayStartHour
  return hoursFromStart * slotWidthPx * 2
}

function durationToWidth(
  startIso: string,
  endIso: string,
  slotWidthPx = SLOT_WIDTH_PX
): number {
  const minutes = dayjs(endIso).diff(dayjs(startIso), 'minute')
  return (minutes / 30) * slotWidthPx
}

export function slotIndexToIso(
  index: number,
  date: string,
  dayStartHour: number
): string {
  const totalMinutes = index * 30
  const hours = dayStartHour + Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return dayjs(date)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0)
    .toISOString()
}

export function isSlotPast(startIso: string): boolean {
  return dayjs(startIso).isBefore(dayjs())
}

function getSlotClass(
  slot: BookedSlot,
  past: boolean,
  ongoing = false
): string {
  switch (slot.type) {
    case 'assignment':
      if (past) return classes.slotAssignmentPast
      if (ongoing) return classes.slotAssignmentFuture
      return slot.assignment?.confirmed
        ? classes.slotAssignmentConfirmed
        : classes.slotAssignmentFuture
    case 'external_calendar':
      return classes.slotExternal
    case 'vacation':
      return classes.slotVacation
    case 'prebook':
      return classes.slotPrebook
    default:
      return classes.slotExternal
  }
}

export const BookedSlotBlock: FC<{
  slot: BookedSlot
  dayStartHour: number
  onClick?: (slot: BookedSlot) => void
  alwaysLightBlue?: boolean
  slotWidth?: number
}> = ({ slot, dayStartHour, onClick, alwaysLightBlue, slotWidth }) => {
  const { t } = useTranslation()
  const sw = slotWidth ?? SLOT_WIDTH_PX
  const left = timeToX(slot.start_at, dayStartHour, sw)
  const width = durationToWidth(slot.start_at, slot.end_at, sw)
  const now = dayjs()
  const isPast = dayjs(slot.end_at).isBefore(now)
  const isOngoing = !isPast && dayjs(slot.start_at).isBefore(now)
  const isNarrow = width <= sw

  const handleClick =
    slot.type === 'assignment' && onClick
      ? (e: React.MouseEvent) => {
          e.stopPropagation()
          onClick(slot)
        }
      : undefined

  if (slot.type === 'assignment' && !isPast) {
    const label = formatDuration(slot.start_at, slot.end_at)
    const isConfirmed =
      !alwaysLightBlue && !isOngoing && !!slot.assignment?.confirmed
    return (
      <div
        className={classNames(
          classes.slotBlock,
          isConfirmed
            ? classes.slotAssignmentConfirmed
            : classes.slotAssignmentFuture,
          {
            [classes.slotClickable]: !!handleClick,
            [classes.slotBlockNarrow]: isNarrow,
          }
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.assignment?.sub_project.ext_id}
        onClick={handleClick}
      >
        <BookingUpcomingIcon className={classes.slotIcon} />
        {!isNarrow && <span className={classes.slotLabel}>{label}</span>}
      </div>
    )
  }

  if (slot.type === 'external_calendar') {
    return (
      <div
        className={classNames(
          classes.slotBlock,
          getSlotClass(slot, isPast, isOngoing),
          { [classes.slotBlockNarrow]: isNarrow }
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.meta}
      >
        <BookingBusyIcon className={classes.slotIconExternal} />
        {!isNarrow && (
          <span className={classes.slotLabelExternal}>
            {t('calendar.booked')}
          </span>
        )}
      </div>
    )
  }

  if (slot.type === 'vacation') {
    return (
      <div
        className={classNames(
          classes.slotBlock,
          getSlotClass(slot, isPast, isOngoing),
          {
            [classes.slotBlockNarrow]: isNarrow,
          }
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.meta}
      >
        <BookingBusyIcon className={classes.slotIconVacation} />
      </div>
    )
  }

  if (slot.type === 'prebook') {
    return (
      <div
        className={classNames(
          classes.slotBlock,
          getSlotClass(slot, isPast, isOngoing)
        )}
        style={{ left: left + 4, width: width - 8 }}
      />
    )
  }

  // Past assignment
  const label = formatDuration(slot.start_at, slot.end_at)
  return (
    <div
      className={classNames(
        classes.slotBlock,
        getSlotClass(slot, isPast, isOngoing),
        {
          [classes.slotClickable]: !!handleClick,
          [classes.slotBlockNarrow]: isNarrow,
        }
      )}
      style={{ left: left + 4, width: width - 8 }}
      title={slot.assignment?.sub_project.ext_id}
      onClick={handleClick}
    >
      <BookingPastIcon className={classes.slotIconMuted} />
      {!isNarrow && <span className={classes.slotLabelMuted}>{label}</span>}
    </div>
  )
}

const CalendarLanguageRow: FC<Props> = ({
  language,
  date,
  dayStartHour,
  dayEndHour,
  onSelectRange,
  onClickSlot,
  onTogglePin,
  onToggleExpand,
  isExpanded,
  readOnly = false,
  slotWidth,
}) => {
  const sw = slotWidth ?? SLOT_WIDTH_PX
  const { t } = useTranslation()
  const { data } = useFetchCalendarDay(date, language.language.id)
  const { data: weekData } = useFetchCalendarWeek(date)
  const { pendingDeepLink, setPendingDeepLink, openSidePanel } =
    useCalendarContext()
  const bookedSlots = data?.booked_slots ?? []

  const langWeekSlots =
    weekData?.languages.find((l) => l.language_id === language.language.id)
      ?.slots ?? null

  const isSlotFullyBooked = useCallback(
    (slotIndex: number): boolean => {
      if (!langWeekSlots) return false
      const hourOfDay = dayStartHour + slotIndex * 0.5
      const blockInDay = Math.floor(hourOfDay / 6)
      const weekDayOffset = dayjs(date).diff(dayjs(weekData!.week_start), 'day')
      if (weekDayOffset < 0 || weekDayOffset > 6) return false
      const slot = langWeekSlots[weekDayOffset * 4 + blockInDay]
      return !!slot && slot.working_hours > 0 && slot.available_vendors === 0
    },
    [langWeekSlots, weekData, date, dayStartHour]
  )

  useEffect(() => {
    if (!pendingDeepLink || !data?.booked_slots) return
    // slotId is the assignment id; fall back to start_at match
    const match = data.booked_slots.find(
      (s) =>
        s.assignment?.id === pendingDeepLink.slotId ||
        s.start_at === pendingDeepLink.slotId
    )
    if (!match) return
    openSidePanel({
      language,
      startIso: match.start_at,
      endIso: match.end_at,
      slot: match,
    })
    setPendingDeepLink(null)
  }, [data, pendingDeepLink])

  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * sw

  const rowRef = useRef<HTMLDivElement>(null)

  const isSlotBooked = useCallback(
    (slotIndex: number): boolean => {
      const slotStart = slotIndexToIso(slotIndex, date, dayStartHour)
      const slotEnd = slotIndexToIso(slotIndex + 1, date, dayStartHour)
      return bookedSlots.some(
        (s) =>
          dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
          dayjs(s.end_at).isAfter(dayjs(slotStart))
      )
    },
    [bookedSlots, date, dayStartHour]
  )

  const { isDragging, selectionLeft, selectionWidth, handleMouseDown, handleMouseMove, handleMouseUp } =
    useDragSelection({
      rowRef,
      date,
      dayStartHour,
      totalSlots,
      slotWidth: sw,
      isSlotBooked,
      onDragComplete: (startIso, endIso) =>
        onSelectRange?.(language.language.id, startIso, endIso),
    })

  return (
    <div className={classes.rowWrapper}>
      <div className={classes.label}>
        {onTogglePin && (
          <button
            className={classNames(classes.pinIcon, {
              [classes.pinIconActive]: language.pinned,
            })}
            onClick={onTogglePin}
            title={
              language.pinned
                ? t('calendar.unpin_language')
                : t('calendar.pin_language')
            }
          >
            <PinIcon />
          </button>
        )}
        <span className={classes.badge}>{language.language.value}</span>
        {onToggleExpand && (
          <button
            className={classNames(classes.collapseBtn, {
              [classes.collapseBtnExpanded]: isExpanded ?? language.pinned,
            })}
            onClick={onToggleExpand}
            aria-label={t('calendar.expand_row')}
          >
            <SmallArrowIcon className={classes.collapseIcon} />
          </button>
        )}
      </div>

      <div
        ref={rowRef}
        className={classes.slotArea}
        style={{ width: totalWidth }}
        onMouseDown={readOnly ? undefined : handleMouseDown}
        onMouseMove={readOnly ? undefined : handleMouseMove}
        onMouseUp={readOnly ? undefined : handleMouseUp}
        onMouseLeave={readOnly ? undefined : handleMouseUp}
      >
        {/* Slot background cells */}
        {!isExpanded &&
          readOnly &&
          Array.from({ length: totalSlots }).map((_, i) => {
            const slotStart = slotIndexToIso(i, date, dayStartHour)
            const slotEnd = slotIndexToIso(i + 1, date, dayStartHour)
            const isCellBooked = bookedSlots.some(
              (s) =>
                dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
                dayjs(s.end_at).isAfter(dayjs(slotStart))
            )
            if (isCellBooked) return null

            if (i % 2 === 1) {
              const prevStart = slotIndexToIso(i - 1, date, dayStartHour)
              const prevEnd = slotIndexToIso(i, date, dayStartHour)
              const prevBooked = bookedSlots.some(
                (s) =>
                  dayjs(s.start_at).isBefore(dayjs(prevEnd)) &&
                  dayjs(s.end_at).isAfter(dayjs(prevStart))
              )
              if (!prevBooked) return null // merge with even cell
            }

            const nextStart = slotIndexToIso(i + 1, date, dayStartHour)
            const nextEnd = slotIndexToIso(i + 2, date, dayStartHour)
            const nextBooked =
              i + 1 < totalSlots &&
              bookedSlots.some(
                (s) =>
                  dayjs(s.start_at).isBefore(dayjs(nextEnd)) &&
                  dayjs(s.end_at).isAfter(dayjs(nextStart))
              )
            const isWide = i % 2 === 0 && i + 1 < totalSlots && !nextBooked

            return (
              <div
                key={i}
                className={classNames(classes.slotCell, classes.slotCellPast)}
                style={{
                  left: i * sw + 4,
                  width: isWide ? sw * 2 - 8 : sw - 8,
                  top: 4,
                  bottom: 4,
                  height: 'auto',
                }}
              />
            )
          })}
        {!isExpanded &&
          !readOnly &&
          Array.from({ length: totalSlots }).map((_, i) => {
            const slotIso = slotIndexToIso(i, date, dayStartHour)
            const isPast = dayjs(slotIso).isBefore(dayjs())
            const isBooked = isSlotBooked(i)
            const fullyBooked = !isPast && !isBooked && isSlotFullyBooked(i)
            const isBookable = !isPast && !isBooked && !fullyBooked

            // Booked cells have no background pill — BookedSlotBlock renders instead
            if (isBooked) return null

            // Odd slots merge into the preceding even cell, but only when
            // the even pair will also render as a pill (not booked).
            if (i % 2 === 1) {
              const prevBooked = isSlotBooked(i - 1)
              const prevIso = slotIndexToIso(i - 1, date, dayStartHour)
              const prevIsPast = isSlotPast(prevIso)
              if (isPast && !prevBooked && prevIsPast) return null
              if (
                isBookable &&
                !prevBooked &&
                !prevIsPast &&
                !isSlotFullyBooked(i - 1)
              )
                return null
              if (
                fullyBooked &&
                !prevBooked &&
                !prevIsPast &&
                isSlotFullyBooked(i - 1)
              )
                return null
              // Even pair is booked — render this odd slot independently below
            }

            // Pill cells: even (or independent odd) past/bookable/fullyBooked
            const isPill = isPast || isBookable || fullyBooked
            const nextSlotIso =
              i + 1 < totalSlots
                ? slotIndexToIso(i + 1, date, dayStartHour)
                : null
            const nextIsPastUnbooked =
              isPast &&
              nextSlotIso !== null &&
              dayjs(nextSlotIso).isBefore(dayjs()) &&
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
            // Wide only for even slots (odd independent slots are always narrow)
            const isWide =
              i % 2 === 0 &&
              (nextIsPastUnbooked || nextIsBookable || nextIsFullyBooked)

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
                  <span className={classes.slotCellBookableLabel}>
                    {isWide ? t('calendar.select_time') : '+'}
                  </span>
                )}
                {fullyBooked && (
                  <>
                    <BookingBusyIcon
                      className={classes.slotCellFullyBookedIcon}
                    />
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

        {/* Drag selection highlight */}
        {!isExpanded && !readOnly && isDragging && (
          <div
            className={classes.selectionHighlight}
            style={{ left: selectionLeft, width: selectionWidth }}
          />
        )}

        {/* Booked slot blocks */}
        {!isExpanded &&
          bookedSlots.map((slot, i) => (
            <BookedSlotBlock
              key={i}
              slot={slot}
              dayStartHour={dayStartHour}
              onClick={onClickSlot}
              alwaysLightBlue={readOnly}
              slotWidth={sw}
            />
          ))}
      </div>
    </div>
  )
}

export default CalendarLanguageRow
