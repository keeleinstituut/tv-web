import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import SmallArrowIcon from 'assets/icons/small_arrow.svg?react'
import PinIcon from 'assets/icons/pin.svg?react'
import AlarmIcon from 'assets/icons/alarm.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import CalendarVendorBadge from 'components/atoms/CalendarVendorBadge/CalendarVendorBadge'
import { CalendarLanguage, VendorWeekData, WeekSlot } from 'types/calendar'
import {
  useFetchCalendarWeekVendors,
  useFetchCalendarWeek,
} from 'hooks/requests/useCalendar'
import { useCalendarExpansion, useCalendarPanel } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'
import classes from './classes.module.scss'

const BLOCK_COUNT = 4 // 4 × 6h blocks per day
const DAYS_IN_WEEK = 7

// ─── Summary block row (collapsed) ────────────────────────────────────────────

const WeekSummaryRow: FC<{
  language: CalendarLanguage
  langSlots: WeekSlot[] | null
  onTogglePin?: () => void
  onToggle: () => void
  expanded: boolean
  isTPM: boolean
  onClickBookedSlot?: (slot: WeekSlot) => void
  dayWidth?: number
}> = ({
  language,
  langSlots,
  onTogglePin,
  onToggle,
  expanded,
  isTPM,
  onClickBookedSlot,
  dayWidth,
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
        <span className={classes.badge}>{language.language.value}</span>
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
      <div className={classes.slotArea}>
        {Array.from({ length: DAYS_IN_WEEK }, (_, dayIdx) => {
          const daySlots = langSlots
            ? langSlots.slice(
                dayIdx * BLOCK_COUNT,
                dayIdx * BLOCK_COUNT + BLOCK_COUNT
              )
            : null
          return (
            <div
              key={dayIdx}
              className={classes.dayGroup}
              style={
                dayWidth ? { width: dayWidth, minWidth: dayWidth } : undefined
              }
            >
              {daySlots
                ? daySlots.map((slot, blockIdx) => {
                    const isBooked = slot.my_bookings_count > 0
                    const clickable = isBooked && !!onClickBookedSlot
                    return (
                      <div
                        key={blockIdx}
                        className={classNames(classes.block, {
                          [classes.blockVendorAvail]:
                            slot.working_hours > 0 &&
                            slot.available_vendors > 0,
                          [classes.blockBooked]: isBooked,
                          [classes.blockClickable]: clickable,
                        })}
                        onClick={
                          clickable ? () => onClickBookedSlot(slot) : undefined
                        }
                      />
                    )
                  })
                : null}
              <div className={classes.block} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Vendor sub-row ────────────────────────────────────────────────────────────

const VendorRow: FC<{
  vendor: VendorWeekData
  dayWidth?: number
}> = ({ vendor, dayWidth }) => {
  const { t } = useTranslation()
  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <CalendarVendorBadge
          vendorId={vendor.id}
          name={vendor.institution_user.name}
        />
      </div>
      <div className={classes.slotArea}>
        {Array.from({ length: DAYS_IN_WEEK }, (_, dayIdx) => {
          const daySlots = vendor.slots.slice(
            dayIdx * BLOCK_COUNT,
            dayIdx * BLOCK_COUNT + BLOCK_COUNT
          )
          const dayBookedHours = daySlots.reduce(
            (sum, s) => sum + (s.booked_hours ?? 0),
            0
          )
          const dayUnavailable = daySlots.every((s) => s.on_vacation)

          const dayGroupStyle = dayWidth
            ? { width: dayWidth, minWidth: dayWidth }
            : undefined

          if (dayUnavailable) {
            return (
              <div
                key={dayIdx}
                className={classes.dayGroup}
                style={dayGroupStyle}
              >
                <div className={classes.dayUnavailableBanner}>
                  <ClockIcon className={classes.unavailableIcon} />
                  <span className={classes.unavailableLabel}>
                    {t('calendar.on_vacation')}
                  </span>
                </div>
              </div>
            )
          }

          if (dayBookedHours > 0) {
            const h = Math.floor(dayBookedHours)
            const m = Math.round((dayBookedHours - h) * 60)
            const bookedLabel = m === 0 ? `${h}h` : `${h}h ${m}min`
            return (
              <div
                key={dayIdx}
                className={classes.dayGroup}
                style={dayGroupStyle}
              >
                <div className={classes.dayBookedBanner}>
                  <AlarmIcon className={classes.bookedIcon} />
                  <span className={classes.bookedLabel}>{bookedLabel}</span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={dayIdx}
              className={classes.dayGroup}
              style={dayGroupStyle}
            >
              {daySlots.map((slot, blockIdx) => (
                <div
                  key={blockIdx}
                  className={classNames(classes.block, {
                    [classes.blockUnavailable]: slot.on_vacation,
                    [classes.blockVendorAvail]:
                      !slot.on_vacation && slot.available,
                    [classes.blockOff]: !slot.on_vacation && !slot.available,
                  })}
                />
              ))}
              <div className={classes.block} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  language: CalendarLanguage
  date: string // any date within the target week
  onTogglePin?: () => void
  dayWidth?: number
}

const CalendarWeekLanguageRow: FC<Props> = ({
  language,
  date,
  onTogglePin,
  dayWidth,
}) => {
  const { isLanguageExpanded, toggleLanguageExpanded } = useCalendarExpansion()
  const { openWeekBookingPanel } = useCalendarPanel()
  const { isTPM, isTranslator } = useCalendarRole()
  const expanded =
    isTPM && (language.pinned || isLanguageExpanded(language.language.id))

  const { data: weekData } = useFetchCalendarWeek(date)
  const langWeekData = weekData?.languages.find(
    (l) => l.language_id === language.language.id
  )
  const langSlots = langWeekData?.slots ?? null

  const { data: vendorData } = useFetchCalendarWeekVendors(
    date,
    expanded ? language.language.id : undefined
  )

  const vendors =
    expanded && vendorData && 'vendors' in vendorData ? vendorData.vendors : []

  return (
    <>
      <WeekSummaryRow
        language={language}
        langSlots={langSlots}
        onTogglePin={onTogglePin}
        onToggle={() => toggleLanguageExpanded(language.language.id)}
        expanded={expanded}
        isTPM={isTPM}
        dayWidth={dayWidth}
        onClickBookedSlot={
          isTranslator
            ? (slot) =>
                openWeekBookingPanel({
                  start_at: slot.start_at,
                  end_at: slot.end_at,
                  language_id: language.language.id,
                })
            : undefined
        }
      />
      {expanded &&
        vendors.map((vendor) => (
          <VendorRow key={vendor.id} vendor={vendor} dayWidth={dayWidth} />
        ))}
      {expanded && <CalendarAddVendorRow />}
    </>
  )
}

export default CalendarWeekLanguageRow
