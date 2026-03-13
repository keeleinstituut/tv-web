import { FC, Fragment, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import 'dayjs/locale/et'
import classNames from 'classnames'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import {
  useFetchCalendarLanguages,
  useFetchCalendarTranslatorLanguages,
  useUpdatePinnedLanguages,
} from 'hooks/requests/useCalendar'
import CalendarLanguageRow, {
  SLOT_WIDTH_PX,
  LABEL_WIDTH_PX,
} from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import { useCurrentTimeMarker } from 'hooks/useCurrentTimeMarker'
import { useCalendarRole } from 'hooks/useCalendarRole'
import CalendarDayVendorRows from 'components/molecules/CalendarDayVendorRows/CalendarDayVendorRows'
import classes from './classes.module.scss'

const DAY_START_HOUR = 9
const DAY_END_HOUR = 22
const TOTAL_SLOTS = (DAY_END_HOUR - DAY_START_HOUR) * 2
const TOTAL_GRID_WIDTH = TOTAL_SLOTS * SLOT_WIDTH_PX

const FORALL_LANGUAGE: import('types/calendar').CalendarLanguage = {
  language: {
    id: 'forall',
    type: 'LANGUAGE',
    value: '/forall',
    name: '',
    meta: { iso3_code: '' },
  },
  pinned: false,
}

// Bold at quarter-day boundaries; regular for others
const BOLD_HOURS = new Set([9, 12, 15, 18, 21])

// Hours to display on the time axis (every full hour)
const HOUR_LABELS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => DAY_START_HOUR + i
)

function currentTimeX(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  // new Date(y, m-1, d, h) always creates local time — no UTC/dayjs ambiguity
  const dayStartMs = new Date(y, m - 1, d, DAY_START_HOUR, 0, 0, 0).getTime()
  const dayEndMs = new Date(y, m - 1, d, DAY_END_HOUR, 0, 0, 0).getTime()
  const nowMs = Date.now()
  if (nowMs < dayStartMs || nowMs > dayEndMs) return -1
  const minutesFromStart = (nowMs - dayStartMs) / 60000
  return (minutesFromStart / 30) * SLOT_WIDTH_PX
}

const CalendarDayView: FC = () => {
  const {
    currentDate,
    navigatePrev,
    navigateNext,
    navigatePrevMonth,
    navigateNextMonth,
    navigateToday,
    openSidePanel,
    isLanguageExpanded,
    toggleLanguageExpanded,
    collapseAll,
    expandAll,
    allCollapsedOverride,
    focusedLanguageId,
  } = useCalendarContext()
  const { t } = useTranslation()
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const canInteract = isTPM || isClient
  const { languages: allLanguages } = useFetchCalendarLanguages()
  const { languages: translatorLanguages } =
    useFetchCalendarTranslatorLanguages()
  const { mutate: updatePinned } = useUpdatePinnedLanguages()

  const languages = isTranslator ? translatorLanguages : allLanguages

  const pinnedCount = allLanguages.filter((l) => l.pinned).length

  const handleTogglePin = (langId: string) => {
    const currentPinned = allLanguages
      .filter((l) => l.pinned)
      .map((l) => l.language.id)
    if (!currentPinned.includes(langId) && currentPinned.length >= 3) return
    const newPinned = currentPinned.includes(langId)
      ? currentPinned.filter((id) => id !== langId)
      : [...currentPinned, langId]
    updatePinned(newPinned)
  }
  const displayLanguages = [...languages].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  )

  const finalLanguages =
    isTranslator && displayLanguages.length === 0
      ? [FORALL_LANGUAGE]
      : displayLanguages

  const visibleLanguages = focusedLanguageId
    ? finalLanguages.filter((l) => l.language.id === focusedLanguageId)
    : finalLanguages

  const dateStr = currentDate.format('YYYY-MM-DD')
  const isToday = currentDate.isSame(dayjs(), 'day')

  // Current time marker — updates every minute
  const timeX = useCurrentTimeMarker(() => currentTimeX(dateStr), [dateStr])

  // Auto-scroll to current time on mount
  const gridScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const x = currentTimeX(dateStr)
    if (!gridScrollRef.current || x < 0) return
    gridScrollRef.current.scrollLeft = Math.max(0, x - 200)
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
              <button
                className={classes.collapseAllBtn}
                onClick={() => {
                  const anyExpanded =
                    !allCollapsedOverride &&
                    visibleLanguages.some(
                      (l) =>
                        l.pinned || isLanguageExpanded(l.language.id)
                    )
                  if (anyExpanded) {
                    collapseAll()
                  } else {
                    expandAll(visibleLanguages.map((l) => l.language.id))
                  }
                }}
                title={t('calendar.collapse_all')}
              >
                <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7L8 2L13 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 13L8 18L13 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

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

          {visibleLanguages.map((lang) => (
            <Fragment key={lang.language.id}>
              <CalendarLanguageRow
                language={lang}
                date={dateStr}
                dayStartHour={DAY_START_HOUR}
                dayEndHour={DAY_END_HOUR}
                readOnly={!canInteract}
                onSelectRange={
                  canInteract
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
                onClickSlot={(slot) => {
                  openSidePanel({
                    language: lang,
                    startIso: slot.start_at,
                    endIso: slot.end_at,
                    slot,
                  })
                }}
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
                isExpanded={
                  !allCollapsedOverride &&
                  (lang.pinned || isLanguageExpanded(lang.language.id))
                }
              />
              {isTPM &&
                !allCollapsedOverride &&
                (lang.pinned || isLanguageExpanded(lang.language.id)) && (
                  <CalendarDayVendorRows
                    language={lang}
                    date={dateStr}
                    dayStartHour={DAY_START_HOUR}
                    dayEndHour={DAY_END_HOUR}
                  />
                )}
            </Fragment>
          ))}

          {/* Needle: inside rowsContainer so it scrolls with the grid */}
          {isToday && timeX >= 0 && (
            <div
              className={classes.timeMarker}
              style={{ left: LABEL_WIDTH_PX + timeX }}
            >
              <div className={classes.timeMarkerDot} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarDayView
