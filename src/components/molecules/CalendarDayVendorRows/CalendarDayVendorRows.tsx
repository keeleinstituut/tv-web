import { FC } from 'react'
import { CalendarLanguage } from 'types/calendar'
import { useFetchCalendarDayVendors } from 'hooks/requests/useCalendar'
import CalendarDayVendorRow from 'components/molecules/CalendarDayVendorRow/CalendarDayVendorRow'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'

interface Props {
  language: CalendarLanguage
  date: string
  dayStartHour: number
  dayEndHour: number
}

const CalendarDayVendorRows: FC<Props> = ({
  language,
  date,
  dayStartHour,
  dayEndHour,
}) => {
  const { data } = useFetchCalendarDayVendors(date, language.language.id)
  const vendors = data && 'vendors' in data ? data.vendors : []

  return (
    <>
      {vendors.map((vendor) => (
        <CalendarDayVendorRow
          key={vendor.id}
          vendor={vendor}
          date={date}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
        />
      ))}
      <CalendarAddVendorRow />
    </>
  )
}

export default CalendarDayVendorRows
