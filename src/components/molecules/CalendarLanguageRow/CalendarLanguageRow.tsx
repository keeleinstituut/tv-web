import { FC, useCallback, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import ClockIcon from 'assets/icons/clock.svg?react'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import { formatDuration } from 'helpers/calendar'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import {
  useFetchCalendarDay,
  useFetchCalendarWeek,
} from 'hooks/requests/useCalendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
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
}

export function timeToX(isoTime: string, dayStartHour: number): number {
  const t = dayjs(isoTime)
  const hoursFromStart = t.hour() + t.minute() / 60 - dayStartHour
  return hoursFromStart * SLOT_WIDTH_PX * 2
}

function durationToWidth(startIso: string, endIso: string): number {
  const minutes = dayjs(endIso).diff(dayjs(startIso), 'minute')
  return (minutes / 30) * SLOT_WIDTH_PX
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
}> = ({ slot, dayStartHour, onClick, alwaysLightBlue }) => {
  const { t } = useTranslation()
  const left = timeToX(slot.start_at, dayStartHour)
  const width = durationToWidth(slot.start_at, slot.end_at)
  const now = dayjs()
  const isPast = dayjs(slot.end_at).isBefore(now)
  const isOngoing = !isPast && dayjs(slot.start_at).isBefore(now)
  const isNarrow = width <= SLOT_WIDTH_PX

  const handleClick =
    slot.type === 'assignment' && onClick
      ? (e: React.MouseEvent) => {
          e.stopPropagation()
          onClick(slot)
        }
      : undefined

  if (slot.type === 'assignment' && !isPast) {
    const label = formatDuration(slot.start_at, slot.end_at)
    const isConfirmed = !alwaysLightBlue && !isOngoing && !!slot.assignment?.confirmed
    return (
      <div
        className={classNames(
          classes.slotBlock,
          isConfirmed ? classes.slotAssignmentConfirmed : classes.slotAssignmentFuture,
          {
            [classes.slotClickable]: !!handleClick,
            [classes.slotBlockNarrow]: isNarrow,
          }
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.assignment?.sub_project.ext_id}
        onClick={handleClick}
      >
        <ClockIcon
          className={isConfirmed ? classes.slotIconWhite : classes.slotIcon}
        />
        {!isNarrow && (
          <span
            className={isConfirmed ? classes.slotLabelWhite : classes.slotLabel}
          >
            {label}
          </span>
        )}
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
        <ClockIcon className={classes.slotIconExternal} />
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
          getSlotClass(slot, isPast, isOngoing)
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.meta}
      />
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
      <ClockIcon className={classes.slotIconMuted} />
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
}) => {
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
      intent: pendingDeepLink.intent,
    })
    setPendingDeepLink(null)
  }, [data, pendingDeepLink])

  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * SLOT_WIDTH_PX

  // Drag selection state
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const isDragging = dragStart !== null && dragEnd !== null
  const rowRef = useRef<HTMLDivElement>(null)

  const getSlotIndexFromX = useCallback(
    (clientX: number): number | null => {
      const rect = rowRef.current?.getBoundingClientRect()
      if (!rect) return null
      const x = clientX - rect.left
      const index = Math.floor(x / SLOT_WIDTH_PX)
      return Math.max(0, Math.min(totalSlots - 1, index))
    },
    [totalSlots]
  )

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const idx = getSlotIndexFromX(e.clientX)
      if (idx === null) return
      // Only allow selection on future, non-booked slots
      const slotIso = slotIndexToIso(idx, date, dayStartHour)
      if (dayjs(slotIso).isBefore(dayjs()) || isSlotBooked(idx)) return
      setDragStart(idx)
      setDragEnd(idx)
    },
    [getSlotIndexFromX, date, dayStartHour, isSlotBooked]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragStart === null) return
      const idx = getSlotIndexFromX(e.clientX)
      if (idx !== null) setDragEnd(idx)
    },
    [dragStart, getSlotIndexFromX]
  )

  const handleMouseUp = useCallback(() => {
    if (dragStart === null || dragEnd === null) {
      setDragStart(null)
      setDragEnd(null)
      return
    }
    const startIdx = Math.min(dragStart, dragEnd)
    const endIdx = Math.max(dragStart, dragEnd) + 1
    const startIso = slotIndexToIso(startIdx, date, dayStartHour)
    const endIso = slotIndexToIso(endIdx, date, dayStartHour)
    onSelectRange?.(language.language.id, startIso, endIso)
    setDragStart(null)
    setDragEnd(null)
  }, [
    dragStart,
    dragEnd,
    date,
    dayStartHour,
    language.language.id,
    onSelectRange,
  ])

  const selectionLeft = isDragging
    ? Math.min(dragStart!, dragEnd!) * SLOT_WIDTH_PX + 4
    : 0
  const selectionWidth = isDragging
    ? (Math.abs(dragEnd! - dragStart!) + 1) * SLOT_WIDTH_PX - 8
    : 0

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
            <svg
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1.5L8.5 3.5L6.2 5.8L6.5 8L5 6.5L3.5 8L3.8 5.8L1.5 3.5L3.5 1.5L4.5 2.5L5 2L5.5 2.5L6.5 1.5Z"
                fill="currentColor"
              />
              <line
                x1="5"
                y1="6.5"
                x2="5"
                y2="9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
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
            <ArrowDownIcon className={classes.collapseIcon} />
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
        {readOnly &&
          Array.from({ length: Math.floor(totalSlots / 2) }).map((_, i) => (
            <div
              key={i}
              className={classNames(classes.slotCell, classes.slotCellPast)}
              style={{
                left: i * SLOT_WIDTH_PX * 2 + 4,
                width: SLOT_WIDTH_PX * 2 - 8,
                top: 4,
                bottom: 4,
                height: 'auto',
              }}
            />
          ))}
        {!readOnly &&
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
                        left: i * SLOT_WIDTH_PX + 4,
                        width: isWide
                          ? SLOT_WIDTH_PX * 2 - 8
                          : SLOT_WIDTH_PX - 8,
                        top: 4,
                        bottom: 4,
                        height: 'auto',
                      }
                    : { left: i * SLOT_WIDTH_PX, width: SLOT_WIDTH_PX }
                }
              >
                {isBookable && (
                  <span className={classes.slotCellBookableLabel}>
                    {isWide ? t('calendar.select_time') : '+'}
                  </span>
                )}
                {fullyBooked && isWide && (
                  <span className={classes.slotCellFullyBookedLabel}>
                    {t('calendar.booked')}
                  </span>
                )}
              </div>
            )
          })}

        {/* Drag selection highlight */}
        {!readOnly && isDragging && (
          <div
            className={classes.selectionHighlight}
            style={{ left: selectionLeft, width: selectionWidth }}
          />
        )}

        {/* Booked slot blocks */}
        {bookedSlots.map((slot, i) => (
          <BookedSlotBlock
            key={i}
            slot={slot}
            dayStartHour={dayStartHour}
            onClick={onClickSlot}
            alwaysLightBlue={readOnly}
          />
        ))}
      </div>
    </div>
  )
}

export default CalendarLanguageRow
