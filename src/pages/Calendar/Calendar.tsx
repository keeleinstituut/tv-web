import { FC, useEffect } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router'
import {
  CalendarProvider,
  useCalendarNav,
  useCalendarPanel,
} from 'components/contexts/CalendarContext'
import CalendarToolbar from 'components/organisms/CalendarToolbar/CalendarToolbar'
import CalendarDayView from 'components/organisms/CalendarDayView/CalendarDayView'
import CalendarWeekView from 'components/organisms/CalendarWeekView/CalendarWeekView'
import CalendarMonthView from 'components/organisms/CalendarMonthView/CalendarMonthView'
import CalendarOrderSidePanel from 'components/organisms/CalendarOrderSidePanel/CalendarOrderSidePanel'
import CalendarWeekBookingPanel from 'components/organisms/CalendarWeekBookingPanel/CalendarWeekBookingPanel'
import classes from './classes.module.scss'

const CalendarContent: FC = () => {
  const { view, setView, setCurrentDate } = useCalendarNav()
  const { setPendingDeepLink } = useCalendarPanel()
  const [searchParams] = useSearchParams()
  const deepLinkSlotId = searchParams.get('slotId')
  const deepLinkDate = searchParams.get('date')

  useEffect(() => {
    if (deepLinkSlotId && deepLinkDate) {
      setCurrentDate(dayjs(deepLinkDate))
      setView('day')
      setPendingDeepLink({ slotId: deepLinkSlotId, date: deepLinkDate })
    }
  }, [
    deepLinkSlotId,
    deepLinkDate,
    setCurrentDate,
    setView,
    setPendingDeepLink,
  ])

  return (
    <div className={classes.container}>
      <CalendarToolbar />
      {view === 'day' && <CalendarDayView />}
      {view === 'week' && <CalendarWeekView />}
      {view === 'month' && <CalendarMonthView />}
      <CalendarOrderSidePanel />
      <CalendarWeekBookingPanel />
    </div>
  )
}

const Calendar: FC = () => (
  <CalendarProvider>
    <CalendarContent />
  </CalendarProvider>
)

export default Calendar
