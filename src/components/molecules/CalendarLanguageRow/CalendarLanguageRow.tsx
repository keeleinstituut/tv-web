import { FC, useCallback, useRef, useState } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import ClockIcon from 'assets/icons/clock.svg?react'
import { formatDuration } from 'helpers/calendar'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import { useFetchCalendarDay } from 'hooks/requests/useCalendar'
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
}

function timeToX(isoTime: string, dayStartHour: number): number {
  const t = dayjs(isoTime)
  const hoursFromStart = t.hour() + t.minute() / 60 - dayStartHour
  return hoursFromStart * SLOT_WIDTH_PX * 2
}

function durationToWidth(startIso: string, endIso: string): number {
  const minutes = dayjs(endIso).diff(dayjs(startIso), 'minute')
  return (minutes / 30) * SLOT_WIDTH_PX
}

function slotIndexToIso(
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

function isSlotPast(startIso: string): boolean {
  return dayjs(startIso).isBefore(dayjs())
}

function getSlotClass(slot: BookedSlot): string {
  const past = isSlotPast(slot.start_at)
  switch (slot.type) {
    case 'assignment':
      return past ? classes.slotAssignmentPast : classes.slotAssignmentFuture
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
}> = ({ slot, dayStartHour, onClick }) => {
  const { t } = useTranslation()
  const left = timeToX(slot.start_at, dayStartHour)
  const width = durationToWidth(slot.start_at, slot.end_at)
  const isPast = isSlotPast(slot.start_at)

  const handleClick =
    slot.type === 'assignment' && onClick
      ? (e: React.MouseEvent) => {
          e.stopPropagation()
          onClick(slot)
        }
      : undefined

  if (slot.type === 'assignment' && !isPast) {
    const label = formatDuration(slot.start_at, slot.end_at)
    return (
      <div
        className={classNames(classes.slotBlock, getSlotClass(slot), {
          [classes.slotClickable]: !!handleClick,
        })}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.assignment?.sub_project.ext_id}
        onClick={handleClick}
      >
        <ClockIcon className={classes.slotIcon} />
        <span className={classes.slotLabel}>{label}</span>
      </div>
    )
  }

  if (slot.type === 'external_calendar') {
    return (
      <div
        className={classNames(classes.slotBlock, getSlotClass(slot))}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.meta}
      >
        <ClockIcon className={classes.slotIconExternal} />
        <span className={classes.slotLabelExternal}>
          {t('calendar.booked')}
        </span>
      </div>
    )
  }

  if (slot.type === 'vacation') {
    return (
      <div
        className={classNames(classes.slotBlock, getSlotClass(slot))}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.meta}
      />
    )
  }

  if (slot.type === 'prebook') {
    return (
      <div
        className={classNames(classes.slotBlock, getSlotClass(slot))}
        style={{ left: left + 4, width: width - 8 }}
      />
    )
  }

  // Past assignment
  const label = formatDuration(slot.start_at, slot.end_at)
  return (
    <div
      className={classNames(classes.slotBlock, getSlotClass(slot), {
        [classes.slotClickable]: !!handleClick,
      })}
      style={{ left: left + 4, width: width - 8 }}
      title={slot.assignment?.sub_project.ext_id}
      onClick={handleClick}
    >
      <ClockIcon className={classes.slotIconMuted} />
      <span className={classes.slotLabelMuted}>{label}</span>
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
}) => {
  const { t } = useTranslation()
  const { data } = useFetchCalendarDay(date, language.language.id)
  const bookedSlots = data?.booked_slots ?? []

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
        <span className={classes.badge}>{language.language.value}</span>
        {onTogglePin && (
          <button
            className={classNames(classes.pinBtn, {
              [classes.pinBtnActive]: language.pinned,
            })}
            onClick={onTogglePin}
            title={
              language.pinned
                ? t('calendar.unpin_language')
                : t('calendar.pin_language')
            }
          />
        )}
      </div>

      <div
        ref={rowRef}
        className={classes.slotArea}
        style={{ width: totalWidth }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Slot background cells (for hover + interaction) */}
        {Array.from({ length: totalSlots }).map((_, i) => {
          const slotIso = slotIndexToIso(i, date, dayStartHour)
          const isPast = dayjs(slotIso).isBefore(dayjs())
          const isBooked = isSlotBooked(i)
          const isBookable = !isPast && !isBooked

          // Odd past/bookable slots are merged into the preceding even cell
          if ((isPast || isBookable) && i % 2 === 1) return null

          const isEvenPast = isPast && i % 2 === 0
          const nextIsPast =
            isEvenPast &&
            i + 1 < totalSlots &&
            dayjs(slotIndexToIso(i + 1, date, dayStartHour)).isBefore(dayjs())

          const isEvenBookable = isBookable && i % 2 === 0
          const nextIsBookable =
            isEvenBookable &&
            i + 1 < totalSlots &&
            !isSlotPast(slotIndexToIso(i + 1, date, dayStartHour)) &&
            !isSlotBooked(i + 1)

          const isWide =
            (isEvenPast && nextIsPast) || (isEvenBookable && nextIsBookable)

          return (
            <div
              key={i}
              className={classNames(classes.slotCell, {
                [classes.slotCellPast]: isEvenPast,
                [classes.slotCellBookable]: isEvenBookable,
                [classes.slotCellHour]: i % 2 === 0,
              })}
              style={
                isEvenPast || isEvenBookable
                  ? {
                      left: i * SLOT_WIDTH_PX + 4,
                      width: isWide ? SLOT_WIDTH_PX * 2 - 8 : SLOT_WIDTH_PX - 8,
                      top: 4,
                      bottom: 4,
                      height: 'auto',
                    }
                  : { left: i * SLOT_WIDTH_PX, width: SLOT_WIDTH_PX }
              }
            >
              {isEvenBookable && (
                <span className={classes.slotCellBookableLabel}>
                  {t('calendar.select_time')}
                </span>
              )}
            </div>
          )
        })}

        {/* Drag selection highlight */}
        {isDragging && (
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
          />
        ))}
      </div>
    </div>
  )
}

export default CalendarLanguageRow
