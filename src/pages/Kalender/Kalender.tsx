import { FC } from 'react'
import { CalendarProvider } from 'components/contexts/CalendarContext'
import CalendarToolbar from 'components/organisms/CalendarToolbar/CalendarToolbar'
import CalendarDayView from 'components/organisms/CalendarDayView/CalendarDayView'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

const CalendarContent: FC = () => {
  const { view } = useCalendarContext()
  return (
    <div className={classes.container}>
      <CalendarToolbar />
      {view === 'day' && <CalendarDayView />}
      {/* Phase 3: view === 'week' && <CalendarWeekView /> */}
      {/* Phase 4: view === 'month' && <CalendarMonthView /> */}
    </div>
  )
}

const Kalender: FC = () => (
  <CalendarProvider>
    <CalendarContent />
  </CalendarProvider>
)

export default Kalender
