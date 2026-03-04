import { FC, useEffect, useMemo } from 'react'
import CalendarFilter from './components/CalendarFilter/CalendarFilter'
// import { CalendarGrid } from './components/CalendarGrid/CalendarGrid'
import { CalendarNavRow } from './components/CalendarNavRow/CalendarNavRow'
import { CalendarTimeRow } from './components/CalendarTimeRow/CalendarTimeRow'
import { getTeostajaDayRows } from './mocks/teostajaDayGrid'
import { LAYOUT_TOTAL_WIDTH_PX } from './constants/layout'
import { useCalendarState } from './hooks/useCalendarState'

interface CalendarHeaderProps {
  monthLabel: string
  weekdayLetter: string
  dateLabel: string
  onPreviousMonth: () => void
  onNextMonth: () => void
  onPreviousDay: () => void
  onNextDay: () => void
}

const CalendarHeader: FC<CalendarHeaderProps> = ({
  monthLabel,
  weekdayLetter,
  dateLabel,
  onPreviousMonth,
  onNextMonth,
  onPreviousDay,
  onNextDay,
}) => (
  <>
    <CalendarNavRow
      variant="month"
      monthLabel={monthLabel}
      onPrevious={onPreviousMonth}
      onNext={onNextMonth}
    />
    <CalendarNavRow
      variant="day"
      weekdayLetter={weekdayLetter}
      dateLabel={dateLabel}
      onPrevious={onPreviousDay}
      onNext={onNextDay}
    />
  </>
)

const Calendar: FC = () => {
  const myRole = 'Teostaja'
  const {
    view,
    setView,
    date,
    monthLabel,
    weekdayLetter,
    dateLabel,
    handlePreviousMonth,
    handleNextMonth,
    handlePreviousDay,
    handleNextDay,
  } = useCalendarState()

  const gridRows = useMemo(() => getTeostajaDayRows(), [])

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
    <div style={{ minWidth: LAYOUT_TOTAL_WIDTH_PX }}>
      <CalendarFilter view={view} onViewChange={setView} role={myRole} />
      <CalendarHeader
        monthLabel={monthLabel}
        weekdayLetter={weekdayLetter}
        dateLabel={dateLabel}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
      />
      <CalendarTimeRow date={date} startHour={9} endHour={21} />
      {/* {view === 'today' && <CalendarGrid rows={gridRows} />} */}
    </div>
  )
}

export default Calendar
