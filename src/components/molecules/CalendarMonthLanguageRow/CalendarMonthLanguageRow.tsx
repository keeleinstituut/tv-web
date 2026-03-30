import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import SmallArrowIcon from 'assets/icons/small_arrow.svg?react'
import PinIcon from 'assets/icons/pin.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import AlarmIcon from 'assets/icons/alarm.svg?react'
import { formatMinutes } from 'helpers/calendar'
import { CalendarLanguage, VendorMonthData } from 'types/calendar'
import { useFetchCalendarMonthVendors } from 'hooks/requests/useCalendar'
import { useCalendarExpansion } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { WeekRange } from 'components/organisms/CalendarMonthView/CalendarMonthView'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'
import CalendarVendorBadge from 'components/atoms/CalendarVendorBadge/CalendarVendorBadge'
import classes from './classes.module.scss'

interface WeekData {
  freeMinutes: number
  bookedMinutes: number
}

function getVendorWeekData(vendor: VendorMonthData, week: WeekRange): WeekData {
  const weekStart = week.start.format('YYYY-MM-DD')
  const weekEnd = week.end.format('YYYY-MM-DD')
  let bookedMinutes = 0

  for (const slot of vendor.slots) {
    if (slot.date < weekStart || slot.date > weekEnd) continue
    if (slot.on_vacation || !slot.available) continue
    bookedMinutes += (slot.booked_hours ?? 0) * 60
  }

  return { freeMinutes: 0, bookedMinutes }
}

// ─── Summary row (collapsed) ──────────────────────────────────────────────────

const MonthSummaryRow: FC<{
  language: CalendarLanguage
  weeks: WeekRange[]
  onTogglePin?: () => void
  onToggle: () => void
  expanded: boolean
  isTPM: boolean
  weekColWidth?: number
}> = ({
  language,
  weeks,
  onTogglePin,
  onToggle,
  expanded,
  isTPM,
  weekColWidth,
}) => {
  const { t } = useTranslation()

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
            <PinIcon />
          </button>
        )}
        <span className={classes.badge}>
          {language.language.value.split('-')[0]}
        </span>
        {isTPM && (
          <button
            className={classNames(classes.collapseBtn, {
              [classes.collapseBtnExpanded]: expanded,
            })}
            onClick={onToggle}
            aria-label={t('calendar.expand_row')}
          >
            <SmallArrowIcon className={classes.collapseIcon} />
          </button>
        )}
      </div>
      {weeks.map((_, i) => (
        <div
          key={i}
          className={classes.weekCell}
          style={{ width: weekColWidth, minWidth: weekColWidth }}
        />
      ))}
      <div
        className={classes.totalCell}
        style={{ width: weekColWidth, minWidth: weekColWidth }}
      />
    </div>
  )
}

// ─── Vendor sub-row ───────────────────────────────────────────────────────────

const VendorRow: FC<{
  vendor: VendorMonthData
  weeks: WeekRange[]
  weekColWidth?: number
}> = ({ vendor, weeks, weekColWidth }) => {
  const isEmo = !vendor.is_internal
  const weekData = weeks.map((week) => getVendorWeekData(vendor, week))
  const totalBooked = weekData.reduce((sum, w) => sum + w.bookedMinutes, 0)
  const cellClass = isEmo ? classes.weekCellBooked : classes.weekCellAvailable
  const iconClass = classNames(classes.cellIcon, {
    [classes.cellIconBooked]: isEmo,
  })
  const labelClass = classNames(classes.cellLabel, {
    [classes.cellLabelBooked]: isEmo,
  })
  const Icon = isEmo ? AlarmIcon : ClockIcon

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <CalendarVendorBadge
          vendorId={vendor.id}
          name={vendor.institution_user.name}
          isEmo={isEmo}
        />
      </div>

      {weekData.map((wd, i) => (
        <div
          key={i}
          className={classes.weekCell}
          style={{ width: weekColWidth, minWidth: weekColWidth }}
        >
          {wd.bookedMinutes > 0 && (
            <div className={cellClass}>
              <Icon className={iconClass} />
              <span className={labelClass}>
                {formatMinutes(wd.bookedMinutes)}
              </span>
            </div>
          )}
        </div>
      ))}

      <div
        className={classes.totalCell}
        style={{ width: weekColWidth, minWidth: weekColWidth }}
      >
        {totalBooked > 0 && (
          <div className={cellClass}>
            <Icon className={iconClass} />
            <span className={labelClass}>{formatMinutes(totalBooked)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  language: CalendarLanguage
  date: string
  weeks: WeekRange[]
  weekColWidth?: number
  onTogglePin?: () => void
}

const CalendarMonthLanguageRow: FC<Props> = ({
  language,
  date,
  weeks,
  weekColWidth,
  onTogglePin,
}) => {
  const { isLanguageExpanded, toggleLanguageExpanded } = useCalendarExpansion()
  const { isTPM } = useCalendarRole()
  const expanded =
    isTPM && (language.pinned || isLanguageExpanded(language.language.id))

  const { data: vendorData } = useFetchCalendarMonthVendors(
    date,
    isTPM ? language.language.id : undefined
  )

  const vendors =
    vendorData && 'vendors' in vendorData ? vendorData.vendors : []

  return (
    <>
      <MonthSummaryRow
        language={language}
        weeks={weeks}
        onTogglePin={onTogglePin}
        onToggle={() => toggleLanguageExpanded(language.language.id)}
        expanded={expanded}
        isTPM={isTPM}
        weekColWidth={weekColWidth}
      />
      {expanded &&
        vendors.map((vendor) => (
          <VendorRow
            key={vendor.id}
            vendor={vendor}
            weeks={weeks}
            weekColWidth={weekColWidth}
          />
        ))}
      {expanded && <CalendarAddVendorRow />}
    </>
  )
}

export default CalendarMonthLanguageRow
