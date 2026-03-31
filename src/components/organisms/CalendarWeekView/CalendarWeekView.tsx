import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/et'
import classNames from 'classnames'
import { useCalendarNav } from 'components/contexts/CalendarContext'
import CalendarWeekLanguageRow from 'components/molecules/CalendarWeekLanguageRow/CalendarWeekLanguageRow'
import { LABEL_WIDTH_PX } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import { useCurrentTimeMarker } from 'hooks/useCurrentTimeMarker'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useCalendarPinning } from 'hooks/useCalendarPinning'
import { useVisibleCalendarLanguages } from 'hooks/useVisibleCalendarLanguages'
import CalendarCollapseExpandButton from 'components/atoms/CalendarCollapseExpandButton/CalendarCollapseExpandButton'
import CalendarTimeMarker from 'components/atoms/CalendarTimeMarker/CalendarTimeMarker'
import CalendarLoadingOverlay from 'components/atoms/CalendarLoadingOverlay/CalendarLoadingOverlay'
import classes from './classes.module.scss'

const MIN_DAY_WIDTH = 160
const LABEL_RIGHT_WIDTH = 64 // cornerCellRight width

// Estonian day letters: index matches dayjs .day() (0=Sun)
const ET_DAY_LETTERS = ['P', 'E', 'T', 'K', 'N', 'R', 'L']
const TIME_LABELS = ['00', '06', '12', '18', '21']

export function getWeekStart(date: Dayjs): Dayjs {
  const day = date.day()
  return date.add(day === 0 ? -6 : 1 - day, 'day')
}

// Each TIME_LABEL is centered in its cell — anchor each hour to its label center
function timeToPixelInDay(
  hour: number,
  minute: number,
  dayWidth: number
): number {
  const blockPx = dayWidth / TIME_LABELS.length
  const breakpoints = [
    { h: 0, px: blockPx * 0.5 },
    { h: 6, px: blockPx * 1.5 },
    { h: 12, px: blockPx * 2.5 },
    { h: 18, px: blockPx * 3.5 },
    { h: 21, px: blockPx * 4.5 },
  ]
  const t = hour + minute / 60
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const a = breakpoints[i]
    const b = breakpoints[i + 1]
    if (t >= a.h && t <= b.h) {
      return a.px + ((t - a.h) / (b.h - a.h)) * (b.px - a.px)
    }
  }
  // After 21h: extrapolate at same rate as 18→21 segment
  const last = breakpoints[breakpoints.length - 1]
  const prev = breakpoints[breakpoints.length - 2]
  const rate = (last.px - prev.px) / (last.h - prev.h)
  return last.px + (t - last.h) * rate
}

function currentNeedleX(weekStart: Dayjs, dayWidth: number): number | null {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const wsDate = new Date(weekStart.year(), weekStart.month(), weekStart.date())
  const todayIndex = Math.round(
    (todayStart.getTime() - wsDate.getTime()) / 86400000
  )
  if (todayIndex < 0 || todayIndex > 6) return null
  return (
    LABEL_WIDTH_PX +
    todayIndex * dayWidth +
    timeToPixelInDay(now.getHours(), now.getMinutes(), dayWidth)
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
    isSearching,
  } = useCalendarNav()

  const { t } = useTranslation()
  const { isTPM, isClient } = useCalendarRole()
  const canInteract = isTPM || isClient
  const { handleTogglePin, pinnedCount } = useCalendarPinning()
  const weekStart = getWeekStart(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
  const dateStr = currentDate.format('YYYY-MM-DD')
  const weekEndStr = weekStart.add(6, 'day').format('YYYY-MM-DD')
  const { visibleLanguages, isLoading, isError } = useVisibleCalendarLanguages(
    weekStart.format('YYYY-MM-DD'),
    weekEndStr
  )

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

  // Fluid column width: fills available container width, min 160px per day
  const containerRef = useRef<HTMLDivElement>(null)
  const [dayWidth, setDayWidth] = useState(MIN_DAY_WIDTH)

  useLayoutEffect(() => {
    const measure = () => {
      if (!containerRef.current) return
      const available =
        containerRef.current.clientWidth - LABEL_WIDTH_PX - LABEL_RIGHT_WIDTH
      setDayWidth(Math.max(MIN_DAY_WIDTH, Math.floor(available / 7)))
    }
    measure()
    const obs = new ResizeObserver(measure)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Current time needle
  const weekStartStr = weekStart.format('YYYY-MM-DD')
  const needleX = useCurrentTimeMarker(
    () => currentNeedleX(weekStart, dayWidth),
    [weekStartStr, dayWidth]
  )

  const gridScrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current time when navigating to a different week
  useEffect(() => {
    if (!gridScrollRef.current) return
    const x = currentNeedleX(weekStart, dayWidth)
    gridScrollRef.current.scrollLeft = x !== null ? Math.max(0, x - 200) : 0
  }, [weekStartStr])

  return (
    <div className={classes.container} ref={containerRef}>
      {(isLoading || isSearching) && (
        <CalendarLoadingOverlay searching={isSearching} />
      )}
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

      {/* Grid scroll area */}
      <div className={classes.gridScroll} ref={gridScrollRef}>
        {/* Row A: day names + week nav (sticky top: 0, scrolls with grid) */}
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
                className={classes.dayHeader}
                style={{ width: dayWidth }}
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

        {/* Row B: time axis + collapse-all toggle (sticky top: row-height) */}
        <div className={classes.timeAxisRow}>
          <div className={classes.cornerCell}>
            {isTPM && (
              <CalendarCollapseExpandButton languages={visibleLanguages} />
            )}
          </div>
          {days.map((_, i) => (
            <div
              key={i}
              className={classes.timeAxis}
              style={{ width: dayWidth }}
            >
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
                    dayIdx * dayWidth +
                    timeIdx * (dayWidth / TIME_LABELS.length),
                }}
              />
            ))
          )}
          {visibleLanguages.map((lang) => (
            <CalendarWeekLanguageRow
              key={lang.language.id}
              language={lang}
              date={dateStr}
              dayWidth={dayWidth}
              onTogglePin={
                canInteract && (lang.pinned || pinnedCount < 3)
                  ? () => handleTogglePin(lang.language.id)
                  : undefined
              }
            />
          ))}

          {isLoading && (
            <div className={classes.stateMessage}>{t('calendar.loading')}</div>
          )}
          {isError && (
            <div className={classes.stateMessage}>
              {t('calendar.error_loading')}
            </div>
          )}

          {needleX !== null && (
            <CalendarTimeMarker
              style={{ left: needleX, top: -40, height: 40 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarWeekView
