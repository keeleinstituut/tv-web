import { FC, useCallback, useRef, useState } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { getInitials } from 'helpers/calendar'
import { BookedSlot, CalendarLanguage, VendorDayData } from 'types/calendar'
import {
  BookedSlotBlock,
  SLOT_WIDTH_PX,
  slotIndexToIso,
  isSlotPast,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

interface Props {
  vendor: VendorDayData
  language: CalendarLanguage
  date: string
  dayStartHour: number
  dayEndHour: number
}

const CalendarDayVendorRow: FC<Props> = ({
  vendor,
  language,
  date,
  dayStartHour,
  dayEndHour,
}) => {
  const { t } = useTranslation()
  const { openSidePanel } = useCalendarContext()
  const initials = getInitials(vendor.institution_user.name)
  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * SLOT_WIDTH_PX

  const rowRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const isDragging = dragStart !== null && dragEnd !== null

  const isSlotBooked = useCallback(
    (slotIndex: number): boolean => {
      const slotStart = slotIndexToIso(slotIndex, date, dayStartHour)
      const slotEnd = slotIndexToIso(slotIndex + 1, date, dayStartHour)
      return vendor.booked_slots.some(
        (s) =>
          dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
          dayjs(s.end_at).isAfter(dayjs(slotStart))
      )
    },
    [vendor.booked_slots, date, dayStartHour]
  )

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const idx = getSlotIndexFromX(e.clientX)
      if (idx === null) return
      const slotIso = slotIndexToIso(idx, date, dayStartHour)
      if (isSlotPast(slotIso) || isSlotBooked(idx)) return
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
    openSidePanel({
      language,
      startIso,
      endIso,
      vendorId: vendor.id,
    })
    setDragStart(null)
    setDragEnd(null)
  }, [dragStart, dragEnd, date, dayStartHour, language, vendor.id, openSidePanel])

  const handleClickSlot = useCallback(
    (slot: BookedSlot) => {
      openSidePanel({
        language,
        startIso: slot.start_at,
        endIso: slot.end_at,
        slot,
        vendorId: vendor.id,
      })
    },
    [language, vendor.id, openSidePanel]
  )

  const selectionLeft = isDragging
    ? Math.min(dragStart!, dragEnd!) * SLOT_WIDTH_PX + 4
    : 0
  const selectionWidth = isDragging
    ? (Math.abs(dragEnd! - dragStart!) + 1) * SLOT_WIDTH_PX - 8
    : 0

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <span className={classes.vendorBadge}>{initials}</span>
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
        {Array.from({ length: totalSlots }).map((_, i) => {
          const slotIso = slotIndexToIso(i, date, dayStartHour)
          const isPast = isSlotPast(slotIso)
          const isBooked = isSlotBooked(i)

          if (isBooked) return null

          if (i % 2 === 1) {
            const prevBooked = isSlotBooked(i - 1)
            if (!prevBooked) {
              const prevPast = isSlotPast(slotIndexToIso(i - 1, date, dayStartHour))
              if (isPast === prevPast) return null
            }
          }

          const nextSlotIso =
            i + 1 < totalSlots ? slotIndexToIso(i + 1, date, dayStartHour) : null
          const nextSameState =
            i % 2 === 0 &&
            nextSlotIso !== null &&
            !isSlotBooked(i + 1) &&
            isSlotPast(nextSlotIso) === isPast
          const isBookable = !isPast

          return (
            <div
              key={i}
              className={classNames(classes.slotCell, {
                [classes.slotCellPast]: isPast,
                [classes.slotCellFuture]: isBookable,
              })}
              style={{
                left: i * SLOT_WIDTH_PX + 4,
                width: nextSameState ? SLOT_WIDTH_PX * 2 - 8 : SLOT_WIDTH_PX - 8,
                top: 4,
                bottom: 4,
                height: 'auto',
              }}
            >
              {isBookable && nextSameState && (
                <span className={classes.slotCellLabel}>
                  {t('calendar.select_time')}
                </span>
              )}
              {isBookable && !nextSameState && (
                <span className={classes.slotCellLabel}>+</span>
              )}
            </div>
          )
        })}

        {isDragging && (
          <div
            className={classes.selectionHighlight}
            style={{ left: selectionLeft, width: selectionWidth }}
          />
        )}

        {vendor.booked_slots.map((slot, i) => (
          <BookedSlotBlock
            key={i}
            slot={slot}
            dayStartHour={dayStartHour}
            onClick={handleClickSlot}
          />
        ))}
      </div>
    </div>
  )
}

export default CalendarDayVendorRow
