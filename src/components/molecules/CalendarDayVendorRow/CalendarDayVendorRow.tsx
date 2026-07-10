import { FC, Fragment, useCallback, useRef } from 'react'
import { useCalendarDay } from 'components/contexts/CalendarDayContext'
import { useSlotStateCheckers } from 'hooks/useSlotStateCheckers'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { BookedSlot, CalendarLanguage, VendorDayData } from 'types/calendar'
import { BookedSlotBlock } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import {
  slotIndexToIso,
  isSlotPast,
  timeToX,
  durationToWidth,
  blockInnerWidth,
} from 'helpers/calendarSlotUtils'
import {
  clipIntervals,
  defaultBookingRange,
  extendToStretchEnd,
  validBookingStartsInInterval,
  TimeInterval,
} from 'helpers/calendarDayOverlaps'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useDragSelection } from 'hooks/useDragSelection'
import CalendarVendorBadge from 'components/atoms/CalendarVendorBadge/CalendarVendorBadge'
import classes from './classes.module.scss'

interface Props {
  vendor: VendorDayData
  language: CalendarLanguage
}

const CalendarDayVendorRow: FC<Props> = ({ vendor, language }) => {
  const { date, dayStartHour, dayEndHour, slotWidth: sw } = useCalendarDay()
  const { t } = useTranslation()
  const { openSidePanel } = useCalendarPanel()
  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * sw

  const rowRef = useRef<HTMLDivElement>(null)

  const { isSlotBooked, isSlotFullyBooked, isSlotFullyAvailable, freeIntervals } =
    useSlotStateCheckers(
      date,
      dayStartHour,
      vendor.booked_slots,
      vendor.available_slots
    )

  const isSlotAvailable = (slotIndex: number) => !isSlotFullyBooked(slotIndex)
  const isSlotBlocked = (slotIndex: number) =>
    isSlotBooked(slotIndex) || isSlotFullyBooked(slotIndex)

  const freeAt = useCallback(
    (i: number): TimeInterval[] =>
      clipIntervals(
        freeIntervals ?? [],
        slotIndexToIso(i, date, dayStartHour),
        slotIndexToIso(i + 1, date, dayStartHour)
      ),
    [freeIntervals, date, dayStartHour]
  )

  const partialAt = useCallback(
    (i: number): boolean => {
      if (isSlotPast(slotIndexToIso(i, date, dayStartHour))) return false
      if (isSlotBooked(i) || isSlotFullyBooked(i)) return false
      return !isSlotFullyAvailable(i)
    },
    [date, dayStartHour, isSlotBooked, isSlotFullyBooked, isSlotFullyAvailable]
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
    isSlotFullyBooked,
    isSlotFullyAvailable,
    freeIntervals,
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
    [language, vendor.id, vendor.institution_user.name, openSidePanel]
  )

  const handleGapClick = (freeInterval: TimeInterval) => {
    const range = defaultBookingRange(freeInterval)
    if (!range) return
    openSidePanel({
      language,
      startIso: range.startIso,
      endIso: range.endIso,
      vendorId: vendor.id,
      vendorName: vendor.institution_user.name,
    })
  }

  const renderGaps = (free: TimeInterval[]) =>
    free.map((f) => {
      const starts = validBookingStartsInInterval(f.start_at, f.end_at)
      if (!starts.length) return null
      const left = timeToX(starts[0], dayStartHour, sw) + 4
      const width = blockInnerWidth(durationToWidth(starts[0], f.end_at, sw))
      return (
        <div
          key={`gap-${f.start_at}`}
          className={classNames(classes.slotCell, classes.slotCellFuture)}
          style={{ left, width, top: 4, bottom: 4, zIndex: 1 }}
          onClick={(e) => {
            e.stopPropagation()
            handleGapClick(extendToStretchEnd(f, freeIntervals ?? []))
          }}
        >
          <span className={classes.slotCellLabel}>+</span>
        </div>
      )
    })

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <CalendarVendorBadge
          vendorId={vendor.id}
          name={vendor.institution_user.name}
          isEmo={vendor.is_emo}
        />
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
          const isAvailable = isSlotAvailable(i)

          // Booked cells render no background; a partially booked cell still
          // exposes its bookable remainder as gap(s).
          if (isBooked) {
            if (isPast) return null
            const gaps = renderGaps(freeAt(i)).filter(Boolean)
            return gaps.length ? <Fragment key={i}>{gaps}</Fragment> : null
          }

          // Availability edge inside the cell: gray base + bookable gap(s).
          if (partialAt(i)) {
            return (
              <Fragment key={i}>
                <div
                  className={classNames(
                    classes.slotCell,
                    classes.slotCellUnavailable
                  )}
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

          if (i % 2 === 1) {
            const prevBooked = isSlotBooked(i - 1)
            if (!prevBooked && !partialAt(i - 1)) {
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
            !partialAt(i + 1) &&
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
