import { FC } from 'react'
import { getInitials } from 'helpers/calendar'
import { VendorDayData } from 'types/calendar'
import {
  BookedSlotBlock,
  SLOT_WIDTH_PX,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import classes from './classes.module.scss'

interface Props {
  vendor: VendorDayData
  dayStartHour: number
  dayEndHour: number
}

const CalendarDayVendorRow: FC<Props> = ({
  vendor,
  dayStartHour,
  dayEndHour,
}) => {
  const initials = getInitials(vendor.institution_user.name)
  const totalWidth = (dayEndHour - dayStartHour) * 2 * SLOT_WIDTH_PX

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <span className={classes.vendorBadge}>{initials}</span>
      </div>
      <div className={classes.slotArea} style={{ width: totalWidth }}>
        {vendor.booked_slots.map((slot, i) => (
          <BookedSlotBlock key={i} slot={slot} dayStartHour={dayStartHour} />
        ))}
      </div>
    </div>
  )
}

export default CalendarDayVendorRow
