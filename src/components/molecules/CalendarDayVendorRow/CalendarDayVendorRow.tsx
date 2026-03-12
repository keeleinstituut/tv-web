import { FC } from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { getInitials } from 'helpers/calendar'
import { VendorDayData } from 'types/calendar'
import {
  BookedSlotBlock,
  SLOT_WIDTH_PX,
  slotIndexToIso,
  isSlotPast,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import classes from './classes.module.scss'

interface Props {
  vendor: VendorDayData
  date: string
  dayStartHour: number
  dayEndHour: number
}

const CalendarDayVendorRow: FC<Props> = ({
  vendor,
  date,
  dayStartHour,
  dayEndHour,
}) => {
  const initials = getInitials(vendor.institution_user.name)
  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * SLOT_WIDTH_PX

  const isSlotBooked = (slotIndex: number): boolean => {
    const slotStart = slotIndexToIso(slotIndex, date, dayStartHour)
    const slotEnd = slotIndexToIso(slotIndex + 1, date, dayStartHour)
    return vendor.booked_slots.some(
      (s) =>
        dayjs(s.start_at).isBefore(dayjs(slotEnd)) &&
        dayjs(s.end_at).isAfter(dayjs(slotStart))
    )
  }

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <span className={classes.vendorBadge}>{initials}</span>
      </div>
      <div className={classes.slotArea} style={{ width: totalWidth }}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const slotIso = slotIndexToIso(i, date, dayStartHour)
          const isPast = isSlotPast(slotIso)
          const isBooked = isSlotBooked(i)

          if (isBooked) return null

          // Odd slots merge into the preceding even cell when both are same state
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

          return (
            <div
              key={i}
              className={classNames(classes.slotCell, {
                [classes.slotCellPast]: isPast,
                [classes.slotCellFuture]: !isPast,
              })}
              style={{
                left: i * SLOT_WIDTH_PX + 4,
                width: nextSameState ? SLOT_WIDTH_PX * 2 - 8 : SLOT_WIDTH_PX - 8,
                top: 4,
                bottom: 4,
                height: 'auto',
              }}
            />
          )
        })}

        {vendor.booked_slots.map((slot, i) => (
          <BookedSlotBlock key={i} slot={slot} dayStartHour={dayStartHour} />
        ))}
      </div>
    </div>
  )
}

export default CalendarDayVendorRow
