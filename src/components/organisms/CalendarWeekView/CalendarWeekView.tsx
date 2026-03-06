import { FC, useEffect, useRef, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/et'
import classNames from 'classnames'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useFetchCalendarLanguages } from 'hooks/requests/useCalendar'
import CalendarWeekLanguageRow from 'components/molecules/CalendarWeekLanguageRow/CalendarWeekLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ExpandIcon from 'assets/icons/expand.svg?react'
import ShrinkIcon from 'assets/icons/shrink.svg?react'
import classes from './classes.module.scss'

export const LABEL_WIDTH_PX = 64
export const DAY_WIDTH_PX = 160

const MONTH_NAV_HEIGHT = 32
const DAY_HEADER_HEIGHT = 40
const DOT_TOP_Y = MONTH_NAV_HEIGHT + DAY_HEADER_HEIGHT - 5

// Estonian day letters: index matches dayjs .day() (0=Sun)
const ET_DAY_LETTERS = ['P', 'E', 'T', 'K', 'N', 'R', 'L']
const TIME_LABELS = ['00', '06', '12', '18', '21']

export function getWeekStart(date: Dayjs): Dayjs {
  const day = date.day()
  return date.add(day === 0 ? -6 : 1 - day, 'day')
}

function currentNeedleX(weekStart: Dayjs): number | null {
  const now = dayjs()
  const todayIndex = now.startOf('day').diff(weekStart.startOf('day'), 'day')
  if (todayIndex < 0 || todayIndex > 6) return null
  const fraction = (now.hour() + now.minute() / 60) / 24
  return LABEL_WIDTH_PX + todayIndex * DAY_WIDTH_PX + fraction * DAY_WIDTH_PX
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
    expandedLanguageIds,
    expandAll,
    collapseAll,
  } = useCalendarContext()

  const { languages } = useFetchCalendarLanguages()

  const allExpanded =
    languages.length > 0 &&
    languages.every((l) => expandedLanguageIds.includes(l.language.id))

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
  const [needleX, setNeedleX] = useState<number | null>(null)
  useEffect(() => {
    const update = () => setNeedleX(currentNeedleX(weekStart))
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [weekStart])

  const gridScrollRef = useRef<HTMLDivElement>(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  const weekStartStr = weekStart.format('YYYY-MM-DD')

  // Reset scroll when navigating to a different week
  useEffect(() => {
    if (!gridScrollRef.current) return
    const scrollTo = needleX !== null ? Math.max(0, needleX - 200) : 0
    gridScrollRef.current.scrollLeft = scrollTo
    setScrollLeft(scrollTo)
  }, [weekStartStr])
  useEffect(() => {
    const el = gridScrollRef.current
    if (!el) return
    const onScroll = () => setScrollLeft(el.scrollLeft)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

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
                left: g.startIdx * DAY_WIDTH_PX - scrollLeft,
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
        {/* Row A: day names + week nav arrows (sticky top: 0) */}
        <div className={classes.dayNamesRow}>
          <div className={classes.cornerCell}>
            <button
              className={classes.navBtn}
              onClick={navigatePrev}
              aria-label="Eelmine nädal"
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
              aria-label="Järgmine nädal"
            >
              <ChevronLeft className={classes.navIconFlip} />
            </button>
          </div>
        </div>

        {/* Row B: time axis + collapse-all toggle (sticky top: 40px) */}
        <div className={classes.timeAxisRow}>
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

export default CalendarWeekView
