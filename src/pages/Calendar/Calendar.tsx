import { FC } from 'react'
import { CalendarProvider } from 'components/contexts/CalendarContext'
import CalendarToolbar from 'components/organisms/CalendarToolbar/CalendarToolbar'
import CalendarDayView from 'components/organisms/CalendarDayView/CalendarDayView'
import CalendarWeekView from 'components/organisms/CalendarWeekView/CalendarWeekView'
import CalendarMonthView from 'components/organisms/CalendarMonthView/CalendarMonthView'
import CalendarOrderSidePanel from 'components/organisms/CalendarOrderSidePanel/CalendarOrderSidePanel'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

const CalendarContent: FC = () => {
  const { view } = useCalendarContext()
  return (
    <div className={classes.container}>
      <CalendarToolbar />
      {view === 'day' && <CalendarDayView />}
      {view === 'week' && <CalendarWeekView />}
      {view === 'month' && <CalendarMonthView />}
      <CalendarOrderSidePanel />
    </div>
  )
}

const Calendar: FC = () => (
  <CalendarProvider>
    <CalendarContent />
  </CalendarProvider>
)

export default Calendar
