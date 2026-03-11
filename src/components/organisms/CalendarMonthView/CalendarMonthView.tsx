import { FC, useEffect, useRef, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/et'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useFetchCalendarLanguages } from 'hooks/requests/useCalendar'
import { getWeekStart } from 'components/organisms/CalendarWeekView/CalendarWeekView'
import CalendarMonthLanguageRow from 'components/molecules/CalendarMonthLanguageRow/CalendarMonthLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ExpandIcon from 'assets/icons/expand.svg?react'
import ShrinkIcon from 'assets/icons/shrink.svg?react'
import classes from './classes.module.scss'

export const LABEL_WIDTH_PX = 64
export const WEEK_COL_WIDTH = 186
export const TOTAL_COL_WIDTH = 186

const MONTH_NAV_HEIGHT = 32
const WEEK_HEADER_HEIGHT = 40
const DAY_LETTERS_HEIGHT = 32
const DOT_TOP_Y = MONTH_NAV_HEIGHT + WEEK_HEADER_HEIGHT - 5

const ET_DAY_LETTERS = ['E', 'T', 'K', 'N', 'R', 'L', 'P']

export interface WeekRange {
  start: Dayjs
  end: Dayjs
}

export function getWeeksForMonth(date: Dayjs): WeekRange[] {
  const firstDay = date.startOf('month')
  const lastDay = date.endOf('month')
  const firstWeekStart = getWeekStart(firstDay)

  const weeks: WeekRange[] = []
  let weekStart = firstWeekStart
  while (weekStart.isBefore(lastDay) || weekStart.isSame(lastDay, 'day')) {
    weeks.push({ start: weekStart, end: weekStart.add(6, 'day') })
    weekStart = weekStart.add(7, 'day')
  }
  return weeks
}

function currentNeedleX(weeks: WeekRange[]): number | null {
  const now = dayjs()
  const weekIdx = weeks.findIndex(
    (w) =>
      (now.isSame(w.start, 'day') || now.isAfter(w.start)) &&
      (now.isSame(w.end, 'day') || now.isBefore(w.end))
  )
  if (weekIdx < 0) return null
  const dow = now.day() // 0=Sun
  const dayIndex = dow === 0 ? 6 : dow - 1 // 0=Mon … 6=Sun
  const fraction = (dayIndex + (now.hour() + now.minute() / 60) / 24) / 7
  return LABEL_WIDTH_PX + weekIdx * WEEK_COL_WIDTH + fraction * WEEK_COL_WIDTH
}

const CalendarMonthView: FC = () => {
  const {
    currentDate,
    setCurrentDate,
    setView,
    navigatePrevMonth,
    navigateNextMonth,
    expandedLanguageIds,
    expandAll,
    collapseAll,
  } = useCalendarContext()

  const { languages } = useFetchCalendarLanguages()

  const allExpanded =
    languages.length > 0 &&
    languages.every((l) => expandedLanguageIds.includes(l.language.id))

  const weeks = getWeeksForMonth(currentDate)
  const dateStr = currentDate.format('YYYY-MM-DD')
  const monthStr = currentDate.format('YYYY-MM')

  // Month groups for nav label
  const monthGroups: {
    label: string
    weekCount: number
    startWeekIdx: number
  }[] = []
  weeks.forEach((week, i) => {
    // Assign week to the month containing its middle day
    const midDay = week.start.add(3, 'day')
    const label = midDay.locale('et').format('MMMM')
    const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
    const last = monthGroups[monthGroups.length - 1]
    if (last && last.label === capitalized) {
      last.weekCount++
    } else {
      monthGroups.push({ label: capitalized, weekCount: 1, startWeekIdx: i })
    }
  })

  // Current time needle
  const [needleX, setNeedleX] = useState<number | null>(null)
  useEffect(() => {
    const update = () => setNeedleX(currentNeedleX(weeks))
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [monthStr])

  // Scroll tracking for month label positioning
  const gridScrollRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    if (!gridScrollRef.current) return
    gridScrollRef.current.scrollLeft = 0
    setScrollLeft(0)
  }, [monthStr])

  useEffect(() => {
    const el = gridScrollRef.current
    if (!el) return
    const onScroll = () => setScrollLeft(el.scrollLeft)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const totalGridWidth =
    LABEL_WIDTH_PX + weeks.length * WEEK_COL_WIDTH + TOTAL_COL_WIDTH

  return (
    <div className={classes.container}>
      {/* Month nav row */}
      <div className={classes.monthNavRow}>
        <div className={classes.navLeft}>
          <button
            className={classes.navBtn}
            onClick={navigatePrevMonth}
            aria-label="Eelmine kuu"
          >
            <ChevronLeft className={classes.navIcon} />
          </button>
        </div>
        <div className={classes.monthCenter}>
          {monthGroups.map((g, i) => (
            <span
              key={i}
              className={classes.monthLabel}
              style={{
                position: 'absolute',
                left: g.startWeekIdx * WEEK_COL_WIDTH - scrollLeft,
              }}
            >
              {g.label}
            </span>
          ))}
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

      {/* Grid scroll area */}
      <div className={classes.gridScroll} ref={gridScrollRef}>
        {/* Row A: week headers + Total (sticky top: 0) */}
        <div
          className={classes.weekHeaderRow}
          style={{ minWidth: totalGridWidth }}
        >
          <div className={classes.cornerCell}>
            <button
              className={classes.navBtn}
              onClick={() =>
                allExpanded
                  ? collapseAll()
                  : expandAll(languages.map((l) => l.language.id))
              }
              aria-label={allExpanded ? 'Ahenda kõik' : 'Laienda kõik'}
            >
              {allExpanded ? (
                <ShrinkIcon className={classes.collapseIcon} />
              ) : (
                <ExpandIcon className={classes.collapseIcon} />
              )}
            </button>
          </div>
          {weeks.map((week, i) => (
            <button
              key={i}
              className={classes.weekHeader}
              onClick={() => {
                setCurrentDate(week.start)
                setView('week')
              }}
            >
              {week.start.format('D.MM')} - {week.end.format('D.MM')}
            </button>
          ))}
          <div className={classes.totalHeader}>Kokku</div>
        </div>

        {/* Row B: day letters (sticky top: WEEK_HEADER_HEIGHT) */}
        <div
          className={classes.dayLettersRow}
          style={{ minWidth: totalGridWidth }}
        >
          <div className={classes.cornerCell} />
          {weeks.map((_, wi) => (
            <div key={wi} className={classes.dayLettersGroup}>
              {ET_DAY_LETTERS.map((letter, di) => (
                <span key={di} className={classes.dayLetter}>
                  {letter}
                </span>
              ))}
            </div>
          ))}
          <div className={classes.totalDayCell} />
        </div>

        {/* Language rows */}
        <div
          className={classes.rowsContainer}
          style={{ minWidth: totalGridWidth }}
        >
          {languages.map((lang) => (
            <CalendarMonthLanguageRow
              key={lang.language.id}
              language={lang}
              date={dateStr}
              weeks={weeks}
            />
          ))}
        </div>
      </div>

      {/* Current time needle */}
      {needleX !== null && (
        <div
          className={classes.timeMarker}
          style={{
            left: needleX - scrollLeft,
            top: DOT_TOP_Y,
            height: 40,
          }}
        >
          <div className={classes.timeMarkerDot} />
        </div>
      )}
    </div>
  )
}

export default CalendarMonthView
