import { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/et'
import classNames from 'classnames'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useFetchCalendarLanguages } from 'hooks/requests/useCalendar'
import CalendarWeekLanguageRow from 'components/molecules/CalendarWeekLanguageRow/CalendarWeekLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import { useCurrentTimeMarker } from 'hooks/useCurrentTimeMarker'
import CalendarCollapseExpandButton from 'components/atoms/CalendarCollapseExpandButton/CalendarCollapseExpandButton'
import classes from './classes.module.scss'

const LABEL_WIDTH_PX = 64
const DAY_WIDTH_PX = 160

// Estonian day letters: index matches dayjs .day() (0=Sun)
const ET_DAY_LETTERS = ['P', 'E', 'T', 'K', 'N', 'R', 'L']
const TIME_LABELS = ['00', '06', '12', '18', '21']

export function getWeekStart(date: Dayjs): Dayjs {
  const day = date.day()
  return date.add(day === 0 ? -6 : 1 - day, 'day')
}

// Each TIME_LABEL is centered in its 32px cell — anchor each hour to its label center
const BLOCK_PX = DAY_WIDTH_PX / 5 // 32px per visual cell
const TIME_BREAKPOINTS = [
  { h: 0, px: BLOCK_PX * 0.5 }, // '00' center = 16px
  { h: 6, px: BLOCK_PX * 1.5 }, // '06' center = 48px
  { h: 12, px: BLOCK_PX * 2.5 }, // '12' center = 80px
  { h: 18, px: BLOCK_PX * 3.5 }, // '18' center = 112px
  { h: 21, px: BLOCK_PX * 4.5 }, // '21' center = 144px
]

function timeToPixelInDay(hour: number, minute: number): number {
  const t = hour + minute / 60
  for (let i = 0; i < TIME_BREAKPOINTS.length - 1; i++) {
    const a = TIME_BREAKPOINTS[i]
    const b = TIME_BREAKPOINTS[i + 1]
    if (t >= a.h && t <= b.h) {
      return a.px + ((t - a.h) / (b.h - a.h)) * (b.px - a.px)
    }
  }
  // After 21h: extrapolate at same rate as 18→21 segment
  const last = TIME_BREAKPOINTS[TIME_BREAKPOINTS.length - 1]
  const prev = TIME_BREAKPOINTS[TIME_BREAKPOINTS.length - 2]
  const rate = (last.px - prev.px) / (last.h - prev.h)
  return last.px + (t - last.h) * rate
}

function currentNeedleX(weekStart: Dayjs): number | null {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const wsDate = new Date(weekStart.year(), weekStart.month(), weekStart.date())
  const todayIndex = Math.round(
    (todayStart.getTime() - wsDate.getTime()) / 86400000
  )
  if (todayIndex < 0 || todayIndex > 6) return null
  return (
    LABEL_WIDTH_PX +
    todayIndex * DAY_WIDTH_PX +
    timeToPixelInDay(now.getHours(), now.getMinutes())
  )
}

const CalendarWeekView: FC = () => {
  const {
    currentDate,
    setCurrentDate,
    setView,
    navigatePrev,
    navigateNext,
    navigatePrevMonth,
    navigateNextMonth,
  } = useCalendarContext()

  const { t } = useTranslation()
  const { languages } = useFetchCalendarLanguages()

  const weekStart = getWeekStart(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
  const dateStr = currentDate.format('YYYY-MM-DD')

  // Month groups for the nav label (week can span two months)
  const monthGroups: { label: string; count: number; startIdx: number }[] = []
  days.forEach((d, i) => {
    const label = d.locale('et').format('MMMM')
    const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
    const last = monthGroups[monthGroups.length - 1]
    if (last && last.label === capitalized) {
      last.count++
    } else {
      monthGroups.push({ label: capitalized, count: 1, startIdx: i })
    }
  })

  // Current time needle
  const weekStartStr = weekStart.format('YYYY-MM-DD')
  const needleX = useCurrentTimeMarker(
    () => currentNeedleX(weekStart),
    [weekStartStr]
  )

  const gridScrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current time when navigating to a different week
  useEffect(() => {
    if (!gridScrollRef.current) return
    const x = currentNeedleX(weekStart)
    gridScrollRef.current.scrollLeft = x !== null ? Math.max(0, x - 200) : 0
  }, [weekStartStr])

  return (
    <div className={classes.container}>
      {/* Month nav row */}
      <div className={classes.monthNavRow}>
        <div className={classes.navLeft}>
          <button
            className={classes.navBtn}
            onClick={navigatePrevMonth}
            aria-label={t('calendar.prev_month')}
          >
            <ChevronLeft className={classes.navIcon} />
          </button>
        </div>
        <div className={classes.monthCenter}>
          <span className={classes.monthLabel}>
            {monthGroups.map((g) => g.label).join(' – ')}
          </span>
        </div>
        <div className={classes.navRight}>
          <button
            className={classes.navBtn}
            onClick={navigateNextMonth}
            aria-label={t('calendar.next_month')}
          >
            <ChevronLeft className={classes.navIconFlip} />
          </button>
        </div>
      </div>

      {/* Row A: day names + week nav arrows — full-width, outside gridScroll */}
      <div className={classes.dayNamesRow}>
        <div className={classes.cornerCell}>
          <button
            className={classes.navBtn}
            onClick={navigatePrev}
            aria-label={t('calendar.prev_week')}
          >
            <ChevronLeft className={classes.navIcon} />
          </button>
        </div>

        {days.map((day, i) => {
          const isToday = day.isSame(dayjs(), 'day')
          return (
            <div
              key={i}
              className={classNames(classes.dayHeader, {
                [classes.dayHeaderToday]: isToday,
              })}
            >
              <span className={classes.dayLetter}>
                {ET_DAY_LETTERS[day.day()]}
              </span>
              <button
                className={classes.dayDateBtn}
                onClick={() => {
                  setCurrentDate(day)
                  setView('day')
                }}
                aria-label={day.format('D.MM')}
              >
                <span
                  className={classNames(classes.dayDate, {
                    [classes.dayDateToday]: isToday,
                  })}
                >
                  {day.format('D.MM')}
                </span>
                {isToday && <span className={classes.todayDot} />}
              </button>
            </div>
          )
        })}

        <div className={classes.cornerCellRight}>
          <button
            className={classes.navBtn}
            onClick={navigateNext}
            aria-label={t('calendar.next_week')}
          >
            <ChevronLeft className={classes.navIconFlip} />
          </button>
        </div>
      </div>

      {/* Grid scroll area */}
      <div className={classes.gridScroll} ref={gridScrollRef}>
        {/* Row B: time axis + collapse-all toggle (sticky top: 0) */}
        <div className={classes.timeAxisRow}>
          <div className={classes.cornerCell}>
            <CalendarCollapseExpandButton
              languageIds={languages.map((l) => l.language.id)}
            />
          </div>
          {days.map((_, i) => (
            <div key={i} className={classes.timeAxis}>
              {TIME_LABELS.map((label) => (
                <div key={label} className={classes.timeLabel}>
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Language rows */}
        <div className={classes.rowsContainer}>
          {/* Vertical time guides for each day × each time label */}
          {days.map((_, dayIdx) =>
            TIME_LABELS.map((_, timeIdx) => (
              <div
                key={`${dayIdx}-${timeIdx}`}
                className={classes.timeGuide}
                style={{
                  left:
                    LABEL_WIDTH_PX +
                    dayIdx * DAY_WIDTH_PX +
                    timeIdx * (DAY_WIDTH_PX / TIME_LABELS.length),
                }}
              />
            ))
          )}
          {languages.map((lang) => (
            <CalendarWeekLanguageRow
              key={lang.language.id}
              language={lang}
              date={dateStr}
            />
          ))}

          {/* Needle: inside rowsContainer so it scrolls with the grid */}
          {needleX !== null && (
            <div className={classes.timeMarker} style={{ left: needleX }}>
              <div className={classes.timeMarkerDot} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarWeekView
