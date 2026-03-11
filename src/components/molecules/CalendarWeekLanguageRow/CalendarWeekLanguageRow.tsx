import { FC } from 'react'
import classNames from 'classnames'
import ChevronDownIcon from 'assets/icons/chevron_left.svg?react'
import AlarmIcon from 'assets/icons/alarm.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import { CalendarLanguage, VendorWeekData } from 'types/calendar'
import { useFetchCalendarWeekVendors } from 'hooks/requests/useCalendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

const BLOCK_COUNT = 4 // 4 × 6h blocks per day
const DAYS_IN_WEEK = 7

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Summary block row (collapsed) ────────────────────────────────────────────

const WeekSummaryRow: FC<{
  language: CalendarLanguage
  onToggle: () => void
  expanded: boolean
}> = ({ language, onToggle, expanded }) => (
  <div className={classes.rowWrapper}>
    <div className={classes.label}>
      <span className={classes.badge}>{language.language.value}</span>
      <button
        className={classes.expandBtn}
        onClick={onToggle}
        aria-label="Laienda rida"
      >
        <ChevronDownIcon
          className={classNames(classes.expandIcon, {
            [classes.expandIconOpen]: expanded,
          })}
        />
      </button>
    </div>
    <div className={classes.slotArea}>
      {Array.from({ length: DAYS_IN_WEEK }, (_, dayIdx) => (
        <div key={dayIdx} className={classes.dayGroup} />
      ))}
    </div>
  </div>
)

// ─── Vendor sub-row ────────────────────────────────────────────────────────────

const VendorRow: FC<{
  vendor: VendorWeekData
}> = ({ vendor }) => {
  const initials = getInitials(vendor.institution_user.name)
  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <span className={classes.vendorBadge}>{initials}</span>
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

          if (dayUnavailable) {
            return (
              <div key={dayIdx} className={classes.dayGroup}>
                <div className={classes.dayUnavailableBanner}>
                  <ClockIcon className={classes.unavailableIcon} />
                  <span className={classes.unavailableLabel}>Hõivatud</span>
                </div>
              </div>
            )
          }

          if (dayBookedHours > 0) {
            return (
              <div key={dayIdx} className={classes.dayGroup}>
                <div className={classes.dayBookedBanner}>
                  <AlarmIcon className={classes.bookedIcon} />
                  <span className={classes.bookedLabel}>EMO</span>
                </div>
              </div>
            )
          }

          return (
            <div key={dayIdx} className={classes.dayGroup}>
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
}

const CalendarWeekLanguageRow: FC<Props> = ({ language, date }) => {
  const { isLanguageExpanded, toggleLanguageExpanded } = useCalendarContext()
  const expanded = isLanguageExpanded(language.language.id)

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
        onToggle={() => toggleLanguageExpanded(language.language.id)}
        expanded={expanded}
      />
      {expanded &&
        vendors.map((vendor) => <VendorRow key={vendor.id} vendor={vendor} />)}
      {expanded && (
        <div className={classes.addVendorRow}>
          <button className={classes.addVendorBtn} aria-label="Lisa tõlkija">
            <AddIcon className={classes.addVendorIcon} />
          </button>
        </div>
      )}
    </>
  )
}

export default CalendarWeekLanguageRow
