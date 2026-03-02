import { FC, useEffect, useState } from 'react'
import CalendarFilter, {
  CalendarView,
} from './components/CalendarFilter/CalendarFilter'

const Calendar: FC = () => {
  const myRole = 'Tellija'
  // const roles = ['Teostaja', 'Tellija', 'Admin']
  const [view, setView] = useState<CalendarView>('today')

  // Disable overflow-x on parent when on this page
  useEffect(() => {
    const mainScroll = document.getElementById('mainScroll')
    if (mainScroll) {
      mainScroll.style.overflowX = 'scroll'
    }
    return () => {
      if (mainScroll) {
        mainScroll.style.overflowX = 'hidden'
      }
    }
  }, [])
  return (
    <div style={{ minWidth: '1200px' }}>
      <CalendarFilter view={view} onViewChange={setView} role={myRole} />
      {/* <CalendarContainer view={view} role={myRole} /> */}
    </div>
  )
}

export default Calendar
