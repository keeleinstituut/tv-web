import { FC } from 'react'
import { useCalendarDay } from 'components/contexts/CalendarDayContext'
import { CalendarLanguage } from 'types/calendar'
import { useFetchCalendarDayVendors } from 'hooks/requests/useCalendar'
import CalendarDayVendorRow from 'components/molecules/CalendarDayVendorRow/CalendarDayVendorRow'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'

interface Props {
  language: CalendarLanguage
}

const CalendarDayVendorRows: FC<Props> = ({ language }) => {
  const { date } = useCalendarDay()
  const { data } = useFetchCalendarDayVendors(date, language.language.id)
  const vendors = data && 'vendors' in data ? data.vendors : []

  return (
    <>
      {vendors.map((vendor) => (
        <CalendarDayVendorRow
          key={vendor.id}
          vendor={vendor}
          language={language}
        />
      ))}
      <CalendarAddVendorRow />
    </>
  )
}

export default CalendarDayVendorRows
