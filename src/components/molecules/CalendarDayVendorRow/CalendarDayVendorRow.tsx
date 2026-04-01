import { FC, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { BookedSlot, CalendarLanguage, VendorDayData } from 'types/calendar'
import {
  BookedSlotBlock,
  SLOT_WIDTH_PX,
  slotIndexToIso,
  isSlotPast,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useDragSelection } from 'hooks/useDragSelection'
import CalendarVendorBadge from 'components/atoms/CalendarVendorBadge/CalendarVendorBadge'
import classes from './classes.module.scss'

interface Props {
  vendor: VendorDayData
  language: CalendarLanguage
  date: string
  dayStartHour: number
  dayEndHour: number
  slotWidth?: number
}

const CalendarDayVendorRow: FC<Props> = ({
  vendor,
  language,
  date,
  dayStartHour,
  dayEndHour,
  slotWidth,
}) => {
  const { t } = useTranslation()
  const { openSidePanel } = useCalendarPanel()
  const sw = slotWidth ?? SLOT_WIDTH_PX
  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * sw

  const rowRef = useRef<HTMLDivElement>(null)

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

  const isSlotAvailable = useCallback(
    (slotIndex: number): boolean => {
      const slotStart = slotIndexToIso(slotIndex, date, dayStartHour)
      const slotEnd = slotIndexToIso(slotIndex + 1, date, dayStartHour)
      return vendor.available_slots.some(
        (s) =>
          dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
          dayjs(s.end_at).isAfter(dayjs(slotStart))
      )
    },
    [vendor.available_slots, date, dayStartHour]
  )

  const isSlotBlocked = useCallback(
    (slotIndex: number): boolean =>
      isSlotBooked(slotIndex) || !isSlotAvailable(slotIndex),
    [isSlotBooked, isSlotAvailable]
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
    isSlotBooked: isSlotBlocked,
    onDragComplete: (startIso, endIso) =>
      openSidePanel({
        language,
        startIso,
        endIso,
        vendorId: vendor.id,
        vendorName: vendor.institution_user.name,
      }),
  })

  const handleClickSlot = useCallback(
    (slot: BookedSlot) => {
      openSidePanel({
        language,
        startIso: slot.start_at,
        endIso: slot.end_at,
        slot,
        vendorId: vendor.id,
        vendorName: vendor.institution_user.name,
      })
    },
    [language, vendor.id, openSidePanel]
  )

  const isEmo = !vendor.is_internal

  return (
    <div className={classes.vendorRowWrapper}>
      <div
        className={classNames(classes.vendorLabel, {
          [classes.vendorLabelEmo]: isEmo,
        })}
      >
        <CalendarVendorBadge
          vendorId={vendor.id}
          name={vendor.institution_user.name}
          isEmo={isEmo}
        />
      </div>
      <div
        ref={rowRef}
        className={classNames(classes.slotArea, {
          [classes.slotAreaEmo]: isEmo,
        })}
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
          const isAvailable = isSlotAvailable(i)

          if (isBooked) return null

          if (i % 2 === 1) {
            const prevBooked = isSlotBooked(i - 1)
            if (!prevBooked) {
              const prevPast = isSlotPast(
                slotIndexToIso(i - 1, date, dayStartHour)
              )
              const prevAvailable = isSlotAvailable(i - 1)
              if (isPast === prevPast && isAvailable === prevAvailable)
                return null
            }
          }

          const nextSlotIso =
            i + 1 < totalSlots
              ? slotIndexToIso(i + 1, date, dayStartHour)
              : null
          const nextSameState =
            i % 2 === 0 &&
            nextSlotIso !== null &&
            !isSlotBooked(i + 1) &&
            isSlotPast(nextSlotIso) === isPast &&
            isSlotAvailable(i + 1) === isAvailable
          const isBookable = !isPast && isAvailable

          return (
            <div
              key={i}
              className={classNames(classes.slotCell, {
                [classes.slotCellPast]: isPast,
                [classes.slotCellUnavailable]: !isPast && !isAvailable,
                [classes.slotCellFuture]: isBookable,
              })}
              style={{
                left: i * sw + 4,
                width: nextSameState ? sw * 2 - 8 : sw - 8,
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

        {vendor.booked_slots.map((slot) => (
          <BookedSlotBlock
            key={`${slot.start_at}-${slot.type}`}
            slot={slot}
            dayStartHour={dayStartHour}
            onClick={handleClickSlot}
            slotWidth={sw}
            rowWidth={totalWidth}
          />
        ))}
      </div>
    </div>
  )
}

export default CalendarDayVendorRow
