import { FC } from 'react'
import { CalendarProvider } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

const Kalender: FC = () => {
  return (
    <CalendarProvider>
      <div className={classes.container}>
        {/* Phase 2: CalendarToolbar */}
        {/* Phase 2: CalendarGrid (day/week/month views) */}
      </div>
    </CalendarProvider>
  )
}

export default Kalender
