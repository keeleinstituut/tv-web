import { FC, useEffect } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router'
import { CalendarProvider } from 'components/contexts/CalendarContext'
import {
  useCalendarContext,
  SidePanelIntent,
} from 'components/contexts/CalendarContext'
import CalendarToolbar from 'components/organisms/CalendarToolbar/CalendarToolbar'
import CalendarDayView from 'components/organisms/CalendarDayView/CalendarDayView'
import CalendarWeekView from 'components/organisms/CalendarWeekView/CalendarWeekView'
import CalendarMonthView from 'components/organisms/CalendarMonthView/CalendarMonthView'
import CalendarOrderSidePanel from 'components/organisms/CalendarOrderSidePanel/CalendarOrderSidePanel'
import CalendarDevRoleSelector from 'components/atoms/CalendarDevRoleSelector/CalendarDevRoleSelector'
import CalendarWeekBookingPanel from 'components/organisms/CalendarWeekBookingPanel/CalendarWeekBookingPanel'
import classes from './classes.module.scss'

const CalendarContent: FC = () => {
  const { view, setView, setCurrentDate, setPendingDeepLink } =
    useCalendarContext()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const slotId = searchParams.get('slotId')
    const date = searchParams.get('date')
    const intent = searchParams.get('intent') as SidePanelIntent | null
    if (slotId && date && intent) {
      setCurrentDate(dayjs(date))
      setView('day')
      setPendingDeepLink({ slotId, date, intent })
    }
  }, []) // eslint-disable-line

  return (
    <div className={classes.container}>
      <CalendarToolbar />
      {view === 'day' && <CalendarDayView />}
      {view === 'week' && <CalendarWeekView />}
      {view === 'month' && <CalendarMonthView />}
      <CalendarOrderSidePanel />
      <CalendarWeekBookingPanel />
      <CalendarDevRoleSelector />
    </div>
  )
}

const Calendar: FC = () => (
  <CalendarProvider>
    <CalendarContent />
  </CalendarProvider>
)

export default Calendar
