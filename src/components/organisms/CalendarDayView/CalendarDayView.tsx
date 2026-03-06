import { FC, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/et'
import classNames from 'classnames'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useFetchCalendarLanguages } from 'hooks/requests/useCalendar'
import CalendarLanguageRow, {
  SLOT_WIDTH_PX,
  LABEL_WIDTH_PX,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

const DAY_START_HOUR = 9
const DAY_END_HOUR = 22
const DATE_NAV_MONTH_HEIGHT = 32
const DATE_NAV_HEIGHT = 32
// Center of dateNav row within .container; dot (10px) top = center - 5
const DOT_CENTER_Y = DATE_NAV_MONTH_HEIGHT + 16 + DATE_NAV_HEIGHT / 2
const DOT_TOP_Y = DOT_CENTER_Y - 5
const TOTAL_SLOTS = (DAY_END_HOUR - DAY_START_HOUR) * 2
const TOTAL_GRID_WIDTH = TOTAL_SLOTS * SLOT_WIDTH_PX

// Bold at quarter-day boundaries; regular for others
const BOLD_HOURS = new Set([9, 12, 15, 18, 21])

// Hours to display on the time axis (every full hour)
const HOUR_LABELS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i
)

function currentTimeX(): number {
  const now = dayjs()
  const hoursFromStart = now.hour() + now.minute() / 60 - DAY_START_HOUR
  if (hoursFromStart < 0 || hoursFromStart > DAY_END_HOUR - DAY_START_HOUR)
    return -1
  return hoursFromStart * SLOT_WIDTH_PX * 2
}

const CalendarDayView: FC = () => {
  const { currentDate, navigatePrev, navigateNext, navigatePrevMonth, navigateNextMonth, navigateToday } =
    useCalendarContext()
  const { languages } = useFetchCalendarLanguages()
  const dateStr = currentDate.locale('et').format('YYYY-MM-DD')
  const isToday = currentDate.isSame(dayjs(), 'day')

  // Current time marker — updates every minute
  const [timeX, setTimeX] = useState(currentTimeX())
  useEffect(() => {
    setTimeX(currentTimeX())
    const interval = setInterval(() => setTimeX(currentTimeX()), 60_000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to current time on mount; track scrollLeft for needle alignment
  const gridScrollRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  useEffect(() => {
    if (!gridScrollRef.current) return
    const scrollTo = Math.max(0, timeX - 200)
    gridScrollRef.current.scrollLeft = scrollTo
    setScrollLeft(scrollTo)
  }, [timeX])
  useEffect(() => {
    const el = gridScrollRef.current
    if (!el) return
    const onScroll = () => setScrollLeft(el.scrollLeft)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const monthLabel = currentDate.locale('et').format('MMMM') // e.g. "november"
  const dayLetter = currentDate.locale('et').format('dd') // e.g. "E"
  const dateShort = currentDate.format('D.MM') // e.g. "28.11"

  return (
    <div className={classes.container}>
      {/* Month row */}
      <div className={classes.dateNavMonth}>
        <div className={classes.navLeft}>
          <button
            className={classes.navBtn}
            onClick={navigatePrevMonth}
            aria-label="Eelmine kuu"
          >
            <ChevronLeft className={classes.navIcon} />
          </button>
        </div>
        <div className={classes.navMonthCenter}>
          <span className={classes.monthLabel}>{monthLabel}</span>
        </div>
        <div className={classes.navRight}>
          <button
            className={classes.navBtn}
            onClick={navigateNextMonth}
            aria-label="Järgmine kuu"
          >
            <ChevronLeft className={classes.navIconFlip} />
          </button>
        </div>
      </div>

      {/* Day nav row */}
      <div className={classes.dateNav}>
        <div className={classes.navLeft}>
          <button
            className={classes.navBtn}
            onClick={navigatePrev}
            aria-label="Eelmine päev"
          >
            <ChevronLeft className={classes.navIcon} />
          </button>
        </div>

        <div className={classes.navCenter}>
          <span className={classes.dayLetter}>{dayLetter}</span>
          <button className={classes.dateLabel} onClick={navigateToday}>
            <span className={classes.dateShort}>{dateShort}</span>
            {isToday && <span className={classes.todayDot} />}
          </button>
        </div>

        <div className={classes.navRight}>
          <button
            className={classes.navBtn}
            onClick={navigateNext}
            aria-label="Järgmine päev"
          >
            <ChevronLeft className={classes.navIconFlip} />
          </button>
        </div>
      </div>

      {/* Grid scroll area */}
      <div className={classes.gridScroll} ref={gridScrollRef}>
        {/* Time header row */}
        <div className={classes.headerRow}>
          {/* Sticky corner cell */}
          <div className={classes.cornerCell} />

          {/* Hour cells */}
          <div
            className={classes.timeHeader}
            style={{ width: TOTAL_GRID_WIDTH }}
          >
            {HOUR_LABELS.map((hour) => (
              <div
                key={hour}
                className={classNames(classes.hourCell, {
                  [classes.hourCellBold]: BOLD_HOURS.has(hour),
                })}
                style={{ left: (hour - DAY_START_HOUR) * SLOT_WIDTH_PX * 2 }}
              >
                {String(hour).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>

        {/* Language rows */}
        <div className={classes.rowsContainer}>
          {/* Full-height vertical hour guides */}
          {HOUR_LABELS.map((hour) => (
            <div
              key={hour}
              className={classes.hourGuide}
              style={{
                left:
                  LABEL_WIDTH_PX + (hour - DAY_START_HOUR) * SLOT_WIDTH_PX * 2,
              }}
            />
          ))}

          {languages.map((lang) => (
            <CalendarLanguageRow
              key={lang.language.id}
              language={lang}
              date={dateStr}
              dayStartHour={DAY_START_HOUR}
              dayEndHour={DAY_END_HOUR}
              onSelectRange={(langId, start, end) => {
                // Phase 6: open side panel
                console.log('Selected range', { langId, start, end })
              }}
            />
          ))}
        </div>
      </div>

      {/* Needle: positioned relative to .container, dot in dateNav row */}
      {timeX >= 0 && (
        <div
          className={classes.timeMarker}
          style={{
            left: LABEL_WIDTH_PX + timeX - scrollLeft,
            top: DOT_TOP_Y,
            height: `calc(100% - ${DOT_TOP_Y}px)`,
          }}
        >
          <div className={classes.timeMarkerDot} />
        </div>
      )}
    </div>
  )
}

export default CalendarDayView
