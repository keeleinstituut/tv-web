import { FC, useMemo } from 'react'
import { useCalendarDay } from 'components/contexts/CalendarDayContext'
import { CalendarLanguage } from 'types/calendar'
import { useFetchCalendarDayVendors } from 'hooks/requests/useCalendar'
import { packSlotsIntoRows, sortBookedSlotsByStart } from 'helpers/calendarDayOverlaps'
import CalendarDayVendorRow from 'components/molecules/CalendarDayVendorRow/CalendarDayVendorRow'
import CalendarDayUnassignedRow from 'components/molecules/CalendarDayUnassignedRow/CalendarDayUnassignedRow'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'

interface Props {
  language: CalendarLanguage
}

const CalendarDayVendorRows: FC<Props> = ({ language }) => {
  const { date } = useCalendarDay()
  const { data } = useFetchCalendarDayVendors(date, language.language.id)
  const vendors = data && 'vendors' in data ? data.vendors : []
  const unassignedSlots =
    data && 'unassigned_slots' in data ? (data.unassigned_slots ?? []) : []

  const unassignedRows = useMemo(
    () => packSlotsIntoRows(sortBookedSlotsByStart(unassignedSlots)),
    [unassignedSlots]
  )

  return (
    <>
      {vendors.map((vendor) => (
        <CalendarDayVendorRow
          key={vendor.id}
          vendor={vendor}
          language={language}
        />
      ))}
      {unassignedRows.map((rowSlots, idx) => (
        <CalendarDayUnassignedRow
          key={`unassigned-row-${idx}`}
          slots={rowSlots}
          language={language}
        />
      ))}
      <CalendarAddVendorRow />
    </>
  )
}

export default CalendarDayVendorRows
