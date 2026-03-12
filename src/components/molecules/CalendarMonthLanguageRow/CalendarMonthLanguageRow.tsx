import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import ChevronDownIcon from 'assets/icons/chevron_left.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import { getInitials } from 'helpers/calendar'
import { CalendarLanguage, VendorMonthData } from 'types/calendar'
import { useFetchCalendarMonthVendors } from 'hooks/requests/useCalendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
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

// ─── Summary row (collapsed) ──────────────────────────────────────────────────

const MonthSummaryRow: FC<{
  language: CalendarLanguage
  weeks: WeekRange[]
  onToggle: () => void
  expanded: boolean
}> = ({ language, weeks, onToggle, expanded }) => {
  const { t } = useTranslation()
  return (
    <div className={classes.rowWrapper}>
      <div className={classes.label}>
        <span className={classes.badge}>{language.language.value}</span>
        <button
          className={classes.expandBtn}
          onClick={onToggle}
          aria-label={t('calendar.expand_row')}
        >
          <ChevronDownIcon
            className={classNames(classes.expandIcon, {
              [classes.expandIconOpen]: expanded,
            })}
          />
        </button>
      </div>
      {weeks.map((_, i) => (
        <div key={i} className={classes.weekCell} />
      ))}
      <div className={classes.totalCell} />
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
}

const CalendarMonthLanguageRow: FC<Props> = ({ language, date, weeks }) => {
  const { isLanguageExpanded, toggleLanguageExpanded } = useCalendarContext()
  const expanded = language.pinned || isLanguageExpanded(language.language.id)

  const { data: vendorData } = useFetchCalendarMonthVendors(
    date,
    expanded ? language.language.id : undefined
  )

  const vendors =
    expanded && vendorData && 'vendors' in vendorData ? vendorData.vendors : []

  return (
    <>
      <MonthSummaryRow
        language={language}
        weeks={weeks}
        onToggle={() => toggleLanguageExpanded(language.language.id)}
        expanded={expanded}
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
