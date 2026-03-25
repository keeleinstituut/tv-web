import {
  FC,
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import 'dayjs/locale/et'
import classNames from 'classnames'
import {
  useCalendarNav,
  useCalendarExpansion,
  useCalendarPanel,
} from 'components/contexts/CalendarContext'
import { useFetchCalendarDay } from 'hooks/requests/useCalendar'
import CalendarLanguageRow, {
  SLOT_WIDTH_PX,
  LABEL_WIDTH_PX,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import { useCurrentTimeMarker } from 'hooks/useCurrentTimeMarker'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useCalendarPinning } from 'hooks/useCalendarPinning'
import { useVisibleCalendarLanguages } from 'hooks/useVisibleCalendarLanguages'
import CalendarDayVendorRows from 'components/molecules/CalendarDayVendorRows/CalendarDayVendorRows'
import CalendarCollapseExpandButton from 'components/atoms/CalendarCollapseExpandButton/CalendarCollapseExpandButton'
import CalendarTimeMarker from 'components/atoms/CalendarTimeMarker/CalendarTimeMarker'
import CalendarLoadingOverlay from 'components/atoms/CalendarLoadingOverlay/CalendarLoadingOverlay'
import classes from './classes.module.scss'

const DAY_START_HOUR = 9
const DAY_END_HOUR = 22
const TOTAL_SLOTS = (DAY_END_HOUR - DAY_START_HOUR) * 2

// Bold at quarter-day boundaries; regular for others
const BOLD_HOURS = new Set([9, 12, 15, 18, 21])

// Hours to display on the time axis (every full hour)
const HOUR_LABELS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i
)

function currentTimeX(dateStr: string, slotWidthPx: number): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  // new Date(y, m-1, d, h) always creates local time — no UTC/dayjs ambiguity
  const dayStartMs = new Date(y, m - 1, d, DAY_START_HOUR, 0, 0, 0).getTime()
  const dayEndMs = new Date(y, m - 1, d, DAY_END_HOUR, 0, 0, 0).getTime()
  const nowMs = Date.now()
  if (nowMs < dayStartMs || nowMs > dayEndMs) return -1
  const minutesFromStart = (nowMs - dayStartMs) / 60000
  return (minutesFromStart / 30) * slotWidthPx
}

const CalendarDayView: FC = () => {
  const {
    currentDate,
    navigatePrev,
    navigateNext,
    navigatePrevMonth,
    navigateNextMonth,
    navigateToday,
    isSearching,
  } = useCalendarNav()
  const { isLanguageExpanded, toggleLanguageExpanded, allCollapsedOverride } =
    useCalendarExpansion()
  const { openSidePanel } = useCalendarPanel()
  const { t } = useTranslation()
  const { isTPM, isClient } = useCalendarRole()
  const canInteract = isTPM || isClient
  const { handleTogglePin, pinnedCount } = useCalendarPinning()
  const dateStr = currentDate.format('YYYY-MM-DD')
  const { languages, visibleLanguages, isLoading, isError } =
    useVisibleCalendarLanguages(dateStr, dateStr)
  const isToday = currentDate.isSame(dayjs(), 'day')
  const { data: dayData } = useFetchCalendarDay(dateStr)

  // Fluid slot width: fills available container width, min 48px per 30 min
  const containerRef = useRef<HTMLDivElement>(null)
  const [slotWidth, setSlotWidth] = useState(SLOT_WIDTH_PX)

  useLayoutEffect(() => {
    const measure = () => {
      if (!containerRef.current) return
      const available = containerRef.current.clientWidth - LABEL_WIDTH_PX
      setSlotWidth(Math.max(SLOT_WIDTH_PX, Math.floor(available / TOTAL_SLOTS)))
    }
    measure()
    const obs = new ResizeObserver(measure)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Current time marker — updates every minute
  const timeX = useCurrentTimeMarker(
    () => currentTimeX(dateStr, slotWidth),
    [dateStr, slotWidth]
  )

  // Auto-scroll to current time on mount
  const gridScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const x = currentTimeX(dateStr, slotWidth)
    if (!gridScrollRef.current || x < 0) return
    gridScrollRef.current.scrollLeft = Math.max(0, x - 200)
  }, [])

  const monthLabel = currentDate.locale('et').format('MMMM') // e.g. "november"
  const dayLetter = currentDate.locale('et').format('dd') // e.g. "E"
  const dateShort = currentDate.format('D.MM') // e.g. "28.11"

  return (
    <div className={classes.container} ref={containerRef}>
      {(isLoading || isSearching) && (
        <CalendarLoadingOverlay searching={isSearching} />
      )}
      {/* Month row */}
      <div className={classes.dateNavMonth}>
        <div className={classes.navLeft}>
          <button
            className={classes.navBtn}
            onClick={navigatePrevMonth}
            aria-label={t('calendar.prev_month')}
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
            aria-label={t('calendar.next_month')}
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
            aria-label={t('calendar.prev_day')}
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
            aria-label={t('calendar.next_day')}
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
          <div className={classes.cornerCell}>
            {isTPM && (
              <CalendarCollapseExpandButton languages={visibleLanguages} />
            )}
          </div>

          {/* Hour cells */}
          <div
            className={classes.timeHeader}
            style={{ width: TOTAL_SLOTS * slotWidth }}
          >
            {HOUR_LABELS.map((hour) => (
              <div
                key={hour}
                className={classNames(classes.hourCell, {
                  [classes.hourCellBold]: BOLD_HOURS.has(hour),
                })}
                style={{ left: (hour - DAY_START_HOUR) * slotWidth * 2 }}
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
                left: LABEL_WIDTH_PX + (hour - DAY_START_HOUR) * slotWidth * 2,
              }}
            />
          ))}

          {visibleLanguages.map((lang) => {
            const isExpanded =
              isTPM &&
              !allCollapsedOverride &&
              (lang.pinned || isLanguageExpanded(lang.language.id))
            return (
              <Fragment key={lang.language.id}>
                <CalendarLanguageRow
                  language={lang}
                  date={dateStr}
                  dayStartHour={DAY_START_HOUR}
                  dayEndHour={DAY_END_HOUR}
                  readOnly={!canInteract || isExpanded}
                  dayData={dayData}
                  onSelectRange={
                    canInteract && !isExpanded
                      ? (langId, start, end) => {
                          const l = languages.find(
                            (l) => l.language.id === langId
                          )
                          if (l)
                            openSidePanel({
                              language: l,
                              startIso: start,
                              endIso: end,
                            })
                        }
                      : undefined
                  }
                  onClickSlot={
                    !isExpanded
                      ? (slot) => {
                          openSidePanel({
                            language: lang,
                            startIso: slot.start_at,
                            endIso: slot.end_at,
                            slot,
                          })
                        }
                      : undefined
                  }
                  onTogglePin={
                    canInteract && (lang.pinned || pinnedCount < 3)
                      ? () => handleTogglePin(lang.language.id)
                      : undefined
                  }
                  onToggleExpand={
                    isTPM
                      ? () => toggleLanguageExpanded(lang.language.id)
                      : undefined
                  }
                  isExpanded={isExpanded}
                  slotWidth={slotWidth}
                />
                {isTPM && isExpanded && (
                  <CalendarDayVendorRows
                    language={lang}
                    date={dateStr}
                    dayStartHour={DAY_START_HOUR}
                    dayEndHour={DAY_END_HOUR}
                    slotWidth={slotWidth}
                  />
                )}
              </Fragment>
            )
          })}

          {isLoading && (
            <div className={classes.stateMessage}>{t('calendar.loading')}</div>
          )}
          {isError && (
            <div className={classes.stateMessage}>
              {t('calendar.error_loading')}
            </div>
          )}

          {isToday && timeX >= 0 && (
            <CalendarTimeMarker
              style={{ left: LABEL_WIDTH_PX + timeX, top: -40, height: 40 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarDayView
