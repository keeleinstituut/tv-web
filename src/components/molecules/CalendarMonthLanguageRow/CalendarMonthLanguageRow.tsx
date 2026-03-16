import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import { getInitials } from 'helpers/calendar'
import { CalendarLanguage, VendorMonthData, MonthSlot } from 'types/calendar'
import {
  useFetchCalendarMonthVendors,
  useFetchCalendarMonth,
} from 'hooks/requests/useCalendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { WeekRange } from 'components/organisms/CalendarMonthView/CalendarMonthView'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'
import classes from './classes.module.scss'

const TOTAL_THRESHOLD_MINUTES = 160 * 60 // >160h shown as ">160h"

function formatMinutes(minutes: number): string {
  if (minutes >= TOTAL_THRESHOLD_MINUTES) return '>160h'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

interface WeekData {
  freeMinutes: number
  bookedMinutes: number
}

function getVendorWeekData(vendor: VendorMonthData, week: WeekRange): WeekData {
  const weekStart = week.start.format('YYYY-MM-DD')
  const weekEnd = week.end.format('YYYY-MM-DD')
  let freeMinutes = 0
  let bookedMinutes = 0

  for (const slot of vendor.slots) {
    if (slot.date < weekStart || slot.date > weekEnd) continue
    if (slot.on_vacation || !slot.available) continue
    const booked = (slot.booked_hours ?? 0) * 60
    bookedMinutes += booked
    freeMinutes += Math.max(0, 8 * 60 - booked)
  }

  return { freeMinutes, bookedMinutes }
}

function getLangWeekAvailableMinutes(
  langSlots: MonthSlot[],
  week: WeekRange
): number {
  const weekStart = week.start.format('YYYY-MM-DD')
  const weekEnd = week.end.format('YYYY-MM-DD')
  let minutes = 0
  for (const slot of langSlots) {
    if (slot.date < weekStart || slot.date > weekEnd) continue
    if (slot.available_vendors > 0) minutes += slot.working_hours * 60
  }
  return minutes
}

// ─── Summary row (collapsed) ──────────────────────────────────────────────────

const MonthSummaryRow: FC<{
  language: CalendarLanguage
  weeks: WeekRange[]
  langSlots: MonthSlot[] | null
  vendorWeekTotals: WeekData[] | null
  onTogglePin?: () => void
  onToggle: () => void
  expanded: boolean
  isTPM: boolean
}> = ({
  language,
  weeks,
  langSlots,
  vendorWeekTotals,
  onTogglePin,
  onToggle,
  expanded,
  isTPM,
}) => {
  const { t } = useTranslation()

  const weekMinutes = weeks.map((week, i) =>
    vendorWeekTotals
      ? vendorWeekTotals[i].bookedMinutes
      : langSlots
        ? getLangWeekAvailableMinutes(langSlots, week)
        : 0
  )
  const totalMinutes = weekMinutes.reduce((sum, m) => sum + m, 0)

  return (
    <div className={classes.rowWrapper}>
      <div className={classes.label}>
        {onTogglePin && (
          <button
            className={classNames(classes.pinIcon, {
              [classes.pinIconActive]: language.pinned,
            })}
            onClick={onTogglePin}
            title={
              language.pinned
                ? t('calendar.unpin_language')
                : t('calendar.pin_language')
            }
          >
            <svg
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 1.5L8.5 3.5L6.2 5.8L6.5 8L5 6.5L3.5 8L3.8 5.8L1.5 3.5L3.5 1.5L4.5 2.5L5 2L5.5 2.5L6.5 1.5Z"
                fill="currentColor"
              />
              <line
                x1="5"
                y1="6.5"
                x2="5"
                y2="9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        <span className={classes.badge}>{language.language.value}</span>
        {isTPM && (
          <button
            className={classNames(classes.collapseBtn, {
              [classes.collapseBtnExpanded]: expanded,
            })}
            onClick={onToggle}
            aria-label={t('calendar.expand_row')}
          >
            <ArrowDownIcon className={classes.collapseIcon} />
          </button>
        )}
      </div>
      {weekMinutes.map((minutes, i) => (
        <div key={i} className={classes.weekCell}>
          {minutes > 0 && (
            <div className={classes.weekCellAvailable}>
              <ClockIcon className={classes.cellIcon} />
              <span className={classes.cellLabel}>
                {formatMinutes(minutes)}
              </span>
            </div>
          )}
        </div>
      ))}
      <div className={classes.totalCell}>
        {totalMinutes > 0 && (
          <div className={classes.weekCellAvailable}>
            <ClockIcon className={classes.cellIcon} />
            <span className={classes.cellLabel}>
              {formatMinutes(totalMinutes)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vendor sub-row ───────────────────────────────────────────────────────────

const VendorRow: FC<{
  vendor: VendorMonthData
  weeks: WeekRange[]
}> = ({ vendor, weeks }) => {
  const initials = getInitials(vendor.institution_user.name)
  const weekData = weeks.map((week) => getVendorWeekData(vendor, week))
  const totalFree = weekData.reduce((sum, w) => sum + w.freeMinutes, 0)
  const totalBooked = weekData.reduce((sum, w) => sum + w.bookedMinutes, 0)

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <span className={classes.vendorBadge}>{initials}</span>
      </div>

      {weekData.map((wd, i) => {
        const hasData = wd.freeMinutes > 0 || wd.bookedMinutes > 0
        const isBooked = wd.bookedMinutes > wd.freeMinutes
        const minutes = isBooked ? wd.bookedMinutes : wd.freeMinutes
        return (
          <div key={i} className={classes.weekCell}>
            {hasData && (
              <div
                className={
                  isBooked ? classes.weekCellBooked : classes.weekCellAvailable
                }
              >
                <ClockIcon
                  className={classNames(classes.cellIcon, {
                    [classes.cellIconBooked]: isBooked,
                  })}
                />
                <span
                  className={classNames(classes.cellLabel, {
                    [classes.cellLabelBooked]: isBooked,
                  })}
                >
                  {formatMinutes(minutes)}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Total cell */}
      <div className={classes.totalCell}>
        {(totalFree > 0 || totalBooked > 0) &&
          (() => {
            const isBooked = totalBooked > totalFree
            const minutes = isBooked ? totalBooked : totalFree
            return (
              <div
                className={
                  isBooked ? classes.weekCellBooked : classes.weekCellAvailable
                }
              >
                <ClockIcon
                  className={classNames(classes.cellIcon, {
                    [classes.cellIconBooked]: isBooked,
                  })}
                />
                <span
                  className={classNames(classes.cellLabel, {
                    [classes.cellLabelBooked]: isBooked,
                  })}
                >
                  {formatMinutes(minutes)}
                </span>
              </div>
            )
          })()}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  language: CalendarLanguage
  date: string
  weeks: WeekRange[]
  onTogglePin?: () => void
}

const CalendarMonthLanguageRow: FC<Props> = ({
  language,
  date,
  weeks,
  onTogglePin,
}) => {
  const { isLanguageExpanded, toggleLanguageExpanded } = useCalendarContext()
  const { isTPM } = useCalendarRole()
  const expanded =
    isTPM && (language.pinned || isLanguageExpanded(language.language.id))

  const { data: monthData } = useFetchCalendarMonth(date)
  const langMonthData = monthData?.languages.find(
    (l) => l.language_id === language.language.id
  )
  const langSlots = langMonthData?.slots ?? null

  const { data: vendorData } = useFetchCalendarMonthVendors(
    date,
    isTPM ? language.language.id : undefined
  )

  const vendors =
    vendorData && 'vendors' in vendorData ? vendorData.vendors : []

  const vendorWeekTotals: WeekData[] | null =
    isTPM && vendors.length > 0
      ? weeks.map((week) =>
          vendors.reduce(
            (acc, vendor) => {
              const wd = getVendorWeekData(vendor, week)
              return {
                freeMinutes: acc.freeMinutes + wd.freeMinutes,
                bookedMinutes: acc.bookedMinutes + wd.bookedMinutes,
              }
            },
            { freeMinutes: 0, bookedMinutes: 0 }
          )
        )
      : null

  return (
    <>
      <MonthSummaryRow
        language={language}
        weeks={weeks}
        langSlots={langSlots}
        vendorWeekTotals={vendorWeekTotals}
        onTogglePin={onTogglePin}
        onToggle={() => toggleLanguageExpanded(language.language.id)}
        expanded={expanded}
        isTPM={isTPM}
      />
      {expanded &&
        vendors.map((vendor) => (
          <VendorRow key={vendor.id} vendor={vendor} weeks={weeks} />
        ))}
      {expanded && <CalendarAddVendorRow />}
    </>
  )
}

export default CalendarMonthLanguageRow
