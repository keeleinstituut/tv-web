import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import SmallArrowIcon from 'assets/icons/small_arrow.svg?react'
import PinIcon from 'assets/icons/pin.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import AlarmIcon from 'assets/icons/alarm.svg?react'
import { formatMinutes } from 'helpers/calendar'
import { CalendarLanguage, MonthSlot, VendorMonthData } from 'types/calendar'
import {
  useFetchCalendarMonth,
  useFetchCalendarMonthVendors,
} from 'hooks/requests/useCalendar'
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

function getWeekHours(monthSlots: MonthSlot[], week: WeekRange): number {
  const ws = week.start.format('YYYY-MM-DD')
  const we = week.end.format('YYYY-MM-DD')
  let hours = 0
  for (const slot of monthSlots) {
    if (slot.date >= ws && slot.date <= we) hours += slot.working_hours
  }
  return hours
}

const MonthSummaryRow: FC<{
  language: CalendarLanguage
  weeks: WeekRange[]
  onTogglePin?: () => void
  onToggle: () => void
  expanded: boolean
  isTPM: boolean
  weekColWidth?: number
  monthSlots?: MonthSlot[]
}> = ({
  language,
  weeks,
  onTogglePin,
  onToggle,
  expanded,
  isTPM,
  weekColWidth,
  monthSlots,
}) => {
  const { t } = useTranslation()

  const weekHours =
    !isTPM && monthSlots ? weeks.map((w) => getWeekHours(monthSlots, w)) : []
  const totalHours = weekHours.reduce((s, h) => s + h, 0)

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
      {isTPM ? (
        <>
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
        </>
      ) : (
        <>
          {weeks.map((_, i) => (
            <div
              key={i}
              className={classes.weekCell}
              style={{ width: weekColWidth, minWidth: weekColWidth }}
            >
              {monthSlots && weekHours[i] > 0 && (
                <div className={classes.weekCellAvailable}>
                  <ClockIcon className={classes.cellIcon} />
                  <span className={classes.cellLabel}>
                    {formatMinutes(weekHours[i] * 60)}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div
            className={classes.totalCell}
            style={{ width: weekColWidth, minWidth: weekColWidth }}
          >
            {monthSlots && totalHours > 0 && (
              <div className={classes.weekCellAvailable}>
                <ClockIcon className={classes.cellIcon} />
                <span className={classes.cellLabel}>
                  {formatMinutes(totalHours * 60)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Vendor sub-row ───────────────────────────────────────────────────────────

const VendorRow: FC<{
  vendor: VendorMonthData
  weeks: WeekRange[]
  weekColWidth?: number
}> = ({ vendor, weeks, weekColWidth }) => {
  const isEmo = vendor.is_emo
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

  const { data: monthData } = useFetchCalendarMonth(date)

  const monthSlots = useMemo(() => {
    if (!monthData) return undefined
    const langData = monthData.languages.find(
      (l) => l.language_id === language.language.id
    )
    return langData?.slots
  }, [monthData, language.language.id])

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
        monthSlots={monthSlots}
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
      {expanded && (
        <CalendarAddVendorRow
          weekCount={weeks.length}
          weekColWidth={weekColWidth}
        />
      )}
    </>
  )
}

export default CalendarMonthLanguageRow
