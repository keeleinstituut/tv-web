import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import classNames from 'classnames'
import SmallArrowIcon from 'assets/icons/small_arrow.svg?react'
import PinIcon from 'assets/icons/pin.svg?react'
import AlarmIcon from 'assets/icons/alarm.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import CalendarVendorBadge from 'components/atoms/CalendarVendorBadge/CalendarVendorBadge'
import {
  BookedSlot,
  CalendarLanguage,
  VendorWeekData,
  WeekSlot,
} from 'types/calendar'

function bookingTimeKey(bk: BookedSlot): string {
  return `${bk.start_at}|${bk.end_at}`
}
import {
  useFetchCalendarWeek,
  useFetchCalendarWeekVendors,
} from 'hooks/requests/useCalendar'
import {
  useCalendarExpansion,
  useCalendarPanel,
} from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import CalendarAddVendorRow from 'components/atoms/CalendarAddVendorRow/CalendarAddVendorRow'
import classes from './classes.module.scss'

const BLOCK_COUNT = 4 // 4 × 6h blocks per day
const DAYS_IN_WEEK = 7

function formatBookedHoursLabel(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

// ─── Summary block row (collapsed) ────────────────────────────────────────────

const WeekSummaryRow: FC<{
  language: CalendarLanguage
  onTogglePin?: () => void
  onToggle: () => void
  expanded: boolean
  isTPM: boolean
  /** Client "my bookings" uses orange; translator/vendor uses blue (not EMO). */
  isClient: boolean
  isTranslator: boolean
  openWeekBookingPanel: (params: {
    start_at: string
    end_at: string
    language_id: string
    language: CalendarLanguage
    bookings: BookedSlot[]
  }) => void
  dayWidth?: number
  slotsByDay?: Record<number, WeekSlot[]>
  /** Week start (API); used to align local 6h blocks with grouped days for vendors. */
  weekStart?: string
}> = ({
  language,
  onTogglePin,
  onToggle,
  expanded,
  isTPM,
  isClient,
  isTranslator,
  openWeekBookingPanel,
  dayWidth,
  slotsByDay,
  weekStart,
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
      <div className={classes.slotArea}>
        {isTPM
          ? Array.from({ length: DAYS_IN_WEEK }, (_, dayIdx) => {
              const dayGroupStyle = dayWidth
                ? { width: dayWidth, minWidth: dayWidth }
                : undefined
              return (
                <div
                  key={dayIdx}
                  className={classes.dayGroup}
                  style={dayGroupStyle}
                />
              )
            })
          : null}
        {!isTPM &&
          Array.from({ length: DAYS_IN_WEEK }, (_, dayIdx) => {
            const daySlots = slotsByDay?.[dayIdx] ?? []
            const dayGroupStyle = dayWidth
              ? { width: dayWidth, minWidth: dayWidth }
              : undefined

            if (!slotsByDay || daySlots.length === 0) {
              return (
                <div
                  key={dayIdx}
                  className={classes.dayGroup}
                  style={dayGroupStyle}
                />
              )
            }

            const dayBookings = daySlots.reduce(
              (sum, s) => sum + s.my_bookings_count,
              0
            )
            // Client: one orange banner for the whole day when "my bookings" exist.
            // Translator/vendor: never use a day-wide banner — show blue per 6h slot only.
            if (dayBookings > 0 && isClient) {
              const hrs = daySlots.reduce((sum, s) => {
                return sum + (s.my_bookings_count > 0 ? s.working_hours : 0)
              }, 0)
              const h = Math.floor(hrs)
              const m = Math.round((hrs - h) * 60)
              const label = m === 0 ? `${h}h` : `${h}h ${m}min`
              return (
                <div
                  key={dayIdx}
                  className={classes.dayGroup}
                  style={dayGroupStyle}
                >
                  <div className={classes.dayBookedBanner}>
                    <AlarmIcon className={classes.bookedIcon} />
                    <span className={classes.bookedLabel}>{label}</span>
                  </div>
                </div>
              )
            }

            const blockSlots: Array<WeekSlot | undefined> =
              Array(BLOCK_COUNT).fill(undefined)

            if (!isClient && weekStart) {
              // Vendor: paint each 6h *local* block that overlaps any assignment.
              // API windows (e.g. 12–18 UTC) used to map to one block via window
              // start only, hiding bookings in later local blocks (e.g. 20:25 local).
              const dayStart = dayjs(weekStart)
                .startOf('day')
                .add(dayIdx, 'day')
              for (let b = 0; b < BLOCK_COUNT; b++) {
                const rangeStart = dayStart.add(b * 6, 'hour')
                const rangeEnd = dayStart.add((b + 1) * 6, 'hour')
                const seen = new Set<string>()
                const bookingsInBlock: BookedSlot[] = []
                for (const slot of daySlots) {
                  for (const bk of slot.my_bookings ?? []) {
                    const key = bookingTimeKey(bk)
                    if (seen.has(key)) continue
                    const bs = dayjs(bk.start_at)
                    const be = dayjs(bk.end_at)
                    if (bs.isBefore(rangeEnd) && be.isAfter(rangeStart)) {
                      seen.add(key)
                      bookingsInBlock.push(bk)
                    }
                  }
                }
                if (bookingsInBlock.length === 0) continue
                const workingMinutes = bookingsInBlock.reduce(
                  (sum, bk) =>
                    sum + dayjs(bk.end_at).diff(dayjs(bk.start_at), 'minute'),
                  0
                )
                const sourceSlot =
                  daySlots.find((s) =>
                    (s.my_bookings ?? []).some((bk) =>
                      bookingsInBlock.some(
                        (x) => bookingTimeKey(x) === bookingTimeKey(bk)
                      )
                    )
                  ) ?? daySlots[0]
                blockSlots[b] = {
                  ...sourceSlot,
                  start_at: rangeStart.toISOString(),
                  end_at: rangeEnd.toISOString(),
                  my_bookings: bookingsInBlock,
                  my_bookings_count: bookingsInBlock.length,
                  working_hours: workingMinutes / 60,
                }
              }
            } else {
              for (const slot of daySlots) {
                const h = dayjs(slot.start_at).hour()
                const idx = Math.floor(h / 6)
                if (idx >= 0 && idx < BLOCK_COUNT) blockSlots[idx] = slot
              }
            }

            return (
              <div
                key={dayIdx}
                className={classes.dayGroup}
                style={dayGroupStyle}
              >
                {blockSlots.map((slot, blockIdx) => {
                  const hasVendorBooking =
                    !isClient && !!slot && slot.my_bookings_count > 0
                  const hasAvail = !!slot && slot.available_vendors > 0
                  const title =
                    hasVendorBooking && slot
                      ? formatBookedHoursLabel(slot.working_hours)
                      : undefined
                  const bookingList = slot?.my_bookings ?? []
                  const isClickableTranslatorSlot =
                    isTranslator &&
                    hasVendorBooking &&
                    bookingList.length > 0 &&
                    !!slot
                  const openPicker = () => {
                    if (!slot || bookingList.length === 0) return
                    openWeekBookingPanel({
                      start_at: slot.start_at,
                      end_at: slot.end_at,
                      language_id: language.language.id,
                      language,
                      bookings: bookingList,
                    })
                  }
                  return (
                    <div
                      key={blockIdx}
                      role={isClickableTranslatorSlot ? 'button' : undefined}
                      tabIndex={isClickableTranslatorSlot ? 0 : undefined}
                      className={classNames(classes.block, {
                        [classes.blockBooked]: hasVendorBooking,
                        [classes.blockVendorAvail]:
                          hasAvail && !hasVendorBooking,
                        [classes.blockOff]:
                          !slot || (!hasVendorBooking && !hasAvail),
                        [classes.blockClickable]: isClickableTranslatorSlot,
                      })}
                      title={title}
                      onClick={
                        isClickableTranslatorSlot
                          ? (e) => {
                              e.stopPropagation()
                              openPicker()
                            }
                          : undefined
                      }
                      onKeyDown={
                        isClickableTranslatorSlot
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                openPicker()
                              }
                            }
                          : undefined
                      }
                    />
                  )
                })}
                <div className={classNames(classes.block, classes.blockOff)} />
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
  const isEmo = !vendor.is_internal
  return (
    <div className={classes.vendorRowWrapper}>
      <div
        className={classNames(classes.vendorLabel, {
          [classes.vendorLabelEmo]: isEmo,
        })}
      >
        <CalendarVendorBadge
          vendorId={vendor.id}
          name={vendor.institution_user.name}
          isEmo={isEmo}
        />
      </div>
      <div
        className={classNames(classes.slotArea, {
          [classes.slotAreaEmo]: isEmo,
        })}
      >
        {Array.from({ length: DAYS_IN_WEEK }, (_, dayIdx) => {
          const daySlots = vendor.slots.slice(
            dayIdx * BLOCK_COUNT,
            dayIdx * BLOCK_COUNT + BLOCK_COUNT
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

          return (
            <div
              key={dayIdx}
              className={classes.dayGroup}
              style={dayGroupStyle}
            >
              {daySlots.map((slot, blockIdx) => {
                const booked = (slot.booked_hours ?? 0) > 0
                return (
                  <div
                    key={blockIdx}
                    className={classNames(classes.block, {
                      [classes.blockBookedWeek]:
                        booked && !slot.on_vacation && isEmo,
                      [classes.blockBooked]:
                        booked && !slot.on_vacation && !isEmo,
                      [classes.blockUnavailable]: slot.on_vacation,
                      [classes.blockVendorAvail]:
                        !slot.on_vacation && !booked && slot.available,
                      [classes.blockOff]:
                        !slot.on_vacation && !booked && !slot.available,
                    })}
                  >
                    {booked && !slot.on_vacation && (
                      <>
                        <AlarmIcon
                          className={
                            isEmo
                              ? classes.bookedBlockIcon
                              : classes.bookedBlockIconInternal
                          }
                        />
                        <span
                          className={
                            isEmo
                              ? classes.bookedBlockLabel
                              : classes.bookedBlockLabelInternal
                          }
                        >
                          {formatBookedHoursLabel(slot.booked_hours ?? 0)}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
              <div className={classNames(classes.block, classes.blockOff)} />
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
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const expanded =
    isTPM && (language.pinned || isLanguageExpanded(language.language.id))

  const { data: vendorData } = useFetchCalendarWeekVendors(
    date,
    expanded ? language.language.id : undefined
  )

  const { data: weekData } = useFetchCalendarWeek(date)

  const slotsByDay = useMemo(() => {
    if (!weekData) return undefined
    const langData = weekData.languages.find(
      (l) => l.language_id === language.language.id
    )
    if (!langData?.slots.length) return undefined
    const ws = dayjs(weekData.week_start).startOf('day')
    const grouped: Record<number, WeekSlot[]> = {}
    for (const slot of langData.slots) {
      const localStart = dayjs(slot.start_at)
      const dayIdx = localStart.startOf('day').diff(ws, 'day')
      if (dayIdx < 0 || dayIdx > 6) continue
      if (!grouped[dayIdx]) grouped[dayIdx] = []
      grouped[dayIdx].push(slot)
    }
    for (const key of Object.keys(grouped)) {
      grouped[Number(key)].sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      )
    }
    return grouped
  }, [weekData, language.language.id])

  const vendors =
    expanded && vendorData && 'vendors' in vendorData ? vendorData.vendors : []

  return (
    <>
      <WeekSummaryRow
        language={language}
        onTogglePin={onTogglePin}
        onToggle={() => toggleLanguageExpanded(language.language.id)}
        expanded={expanded}
        isTPM={isTPM}
        isClient={isClient}
        isTranslator={isTranslator}
        openWeekBookingPanel={openWeekBookingPanel}
        dayWidth={dayWidth}
        slotsByDay={slotsByDay}
        weekStart={weekData?.week_start}
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
