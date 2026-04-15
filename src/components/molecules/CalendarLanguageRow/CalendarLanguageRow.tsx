import { FC, useEffect, useMemo, useRef } from 'react'
import { useCalendarDay } from 'components/contexts/CalendarDayContext'
import { useSlotStateCheckers } from 'hooks/useSlotStateCheckers'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import BookingUpcomingIcon from 'assets/icons/booking_upcoming.svg?react'
import BookingPastIcon from 'assets/icons/booking_past.svg?react'
import BookingBusyIcon from 'assets/icons/booking_busy.svg?react'
import PinIcon from 'assets/icons/pin.svg?react'
import SmallArrowIcon from 'assets/icons/small_arrow.svg?react'
import { formatDuration } from 'helpers/calendar'
import {
  mergeClientPrebookSlot,
  mergedOverlapIntervals,
} from 'helpers/calendarDayOverlaps'
import CalendarSlotCells from 'components/molecules/CalendarSlotCells/CalendarSlotCells'
import {
  timeToX,
  durationToWidth,
  slotIndexToIso,
  isSlotPast,
  SLOT_WIDTH_PX,
} from 'helpers/calendarSlotUtils'
export { SLOT_WIDTH_PX, timeToX, slotIndexToIso, isSlotPast }
import {
  BookedSlot,
  CalendarDayResponse,
  CalendarLanguage,
} from 'types/calendar'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useDragSelection } from 'hooks/useDragSelection'
import classes from './classes.module.scss'

export const ROW_HEIGHT_PX = 40
export const LABEL_WIDTH_PX = 64

interface Props {
  language: CalendarLanguage
  onSelectRange?: (langId: string, startIso: string, endIso: string) => void
  onClickSlot?: (slot: BookedSlot) => void
  onTogglePin?: () => void
  onToggleExpand?: () => void
  isExpanded?: boolean
  /** Client day: hide booking blocks on the header row when collapsed with overlapping bookings */
  omitBookedSlotBlocks?: boolean
  /** When true the row is a header-only strip: no slot cells, no interaction */
  readOnly?: boolean
  dayData?: CalendarDayResponse
}

function getSlotClass(
  slot: BookedSlot,
  past: boolean,
  ongoing = false
): string {
  switch (slot.type) {
    case 'assignment':
      if (past) return classes.slotAssignmentPast
      if (ongoing) return classes.slotAssignmentFuture
      return slot.assignment?.confirmed
        ? classes.slotAssignmentConfirmed
        : classes.slotAssignmentFuture
    case 'external_calendar':
      return classes.slotExternal
    case 'vacation':
    case 'absence':
      return classes.slotVacation
    case 'prebook':
      return classes.slotPrebook
    default:
      return classes.slotExternal
  }
}

export const BookedSlotBlock: FC<{
  slot: BookedSlot
  dayStartHour: number
  onClick?: (slot: BookedSlot) => void
  alwaysLightBlue?: boolean
  slotWidth?: number
  rowWidth?: number
}> = ({
  slot,
  dayStartHour,
  onClick,
  alwaysLightBlue,
  slotWidth,
  rowWidth,
}) => {
  const { t } = useTranslation()
  const sw = slotWidth ?? SLOT_WIDTH_PX
  const left = timeToX(slot.start_at, dayStartHour, sw)
  const width = durationToWidth(slot.start_at, slot.end_at, sw)
  const now = dayjs()
  const isPast = dayjs(slot.end_at).isBefore(now)
  const isOngoing = !isPast && dayjs(slot.start_at).isBefore(now)
  const isNarrow = width <= sw

  const handleClick =
    slot.type === 'assignment' && onClick
      ? (e: React.MouseEvent) => {
          e.stopPropagation()
          onClick(slot)
        }
      : undefined

  if (slot.type === 'assignment' && !isPast) {
    const label = formatDuration(slot.start_at, slot.end_at)
    const isConfirmed =
      !alwaysLightBlue && !isOngoing && !!slot.assignment?.confirmed
    return (
      <div
        className={classNames(
          classes.slotBlock,
          isConfirmed
            ? classes.slotAssignmentConfirmed
            : classes.slotAssignmentFuture,
          {
            [classes.slotClickable]: !!handleClick,
            [classes.slotBlockNarrow]: isNarrow,
          }
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.assignment?.sub_project.ext_id}
        onClick={handleClick}
      >
        <BookingUpcomingIcon className={classes.slotIcon} />
        {!isNarrow && <span className={classes.slotLabel}>{label}</span>}
      </div>
    )
  }

  if (slot.type === 'external_calendar') {
    return (
      <div
        className={classNames(
          classes.slotBlock,
          getSlotClass(slot, isPast, isOngoing),
          { [classes.slotBlockNarrow]: isNarrow }
        )}
        style={{ left: left + 4, width: width - 8 }}
        title={slot.meta}
      >
        <BookingBusyIcon className={classes.slotIconExternal} />
        {!isNarrow && (
          <span className={classes.slotLabelExternal}>
            {t('calendar.booked')}
          </span>
        )}
      </div>
    )
  }

  if (slot.type === 'vacation' || slot.type === 'absence') {
    const vacLeft = rowWidth !== undefined ? Math.max(left, 0) : left
    const vacWidth =
      rowWidth !== undefined
        ? Math.max(Math.min(left + width, rowWidth) - vacLeft, 0)
        : width
    return (
      <div
        className={classNames(
          classes.slotBlock,
          getSlotClass(slot, isPast, isOngoing),
          {
            [classes.slotBlockNarrow]: vacWidth <= sw,
          }
        )}
        style={{ left: vacLeft + 4, width: vacWidth - 8 }}
        title={slot.meta}
      >
        <BookingBusyIcon className={classes.slotIconVacation} />
        {!isNarrow && (
          <span className={classes.slotLabelExternal}>
            {t('calendar.booked')}
          </span>
        )}
      </div>
    )
  }

  if (slot.type === 'prebook') {
    return (
      <div
        className={classNames(
          classes.slotBlock,
          getSlotClass(slot, isPast, isOngoing)
        )}
        style={{ left: left + 4, width: width - 8 }}
      />
    )
  }

  // Past assignment
  const label = formatDuration(slot.start_at, slot.end_at)
  return (
    <div
      className={classNames(
        classes.slotBlock,
        getSlotClass(slot, isPast, isOngoing),
        {
          [classes.slotClickable]: !!handleClick,
          [classes.slotBlockNarrow]: isNarrow,
        }
      )}
      style={{ left: left + 4, width: width - 8 }}
      title={slot.assignment?.sub_project.ext_id}
      onClick={handleClick}
    >
      <BookingPastIcon className={classes.slotIconMuted} />
      {!isNarrow && <span className={classes.slotLabelMuted}>{label}</span>}
    </div>
  )
}

const CalendarLanguageRow: FC<Props> = ({
  language,
  onSelectRange,
  onClickSlot,
  onTogglePin,
  onToggleExpand,
  isExpanded,
  omitBookedSlotBlocks = false,
  readOnly = false,
  dayData,
}) => {
  const { date, dayStartHour, dayEndHour, slotWidth: sw } = useCalendarDay()
  const { t } = useTranslation()
  const {
    sidePanelSelection,
    pendingDeepLink,
    setPendingDeepLink,
    openSidePanel,
  } = useCalendarPanel()

  const rawBookedSlots =
    dayData?.booked_slots_by_language[language.language.id] ??
    dayData?.booked_slots ??
    []

  const bookedSlots = useMemo(
    () => mergeClientPrebookSlot(language, rawBookedSlots, sidePanelSelection),
    [language, rawBookedSlots, sidePanelSelection]
  )

  const langAvailSlots = dayData?.available_slots_by_language
    ? (dayData.available_slots_by_language[language.language.id] ?? [])
    : undefined

  const { isSlotFullyBooked } = useSlotStateCheckers(
    date,
    dayStartHour,
    [],
    langAvailSlots
  )

  useEffect(() => {
    if (!pendingDeepLink || !bookedSlots.length) return
    // slotId is the assignment id; fall back to start_at match
    const match = bookedSlots.find(
      (s) =>
        s.assignment?.id === pendingDeepLink.slotId ||
        s.start_at === pendingDeepLink.slotId
    )
    if (!match) return
    openSidePanel({
      language,
      startIso: match.start_at,
      endIso: match.end_at,
      slot: match,
    })
    setPendingDeepLink(null)
  }, [
    bookedSlots,
    pendingDeepLink,
    openSidePanel,
    language,
    setPendingDeepLink,
  ])

  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * sw

  const rowRef = useRef<HTMLDivElement>(null)

  const { isSlotBooked } = useSlotStateCheckers(date, dayStartHour, bookedSlots)

  const overlapCollapsedIntervals = useMemo(
    () => (omitBookedSlotBlocks ? mergedOverlapIntervals(bookedSlots) : []),
    [omitBookedSlotBlocks, bookedSlots]
  )

  const {
    isDragging,
    selectionLeft,
    selectionWidth,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDragSelection({
    rowRef,
    date,
    dayStartHour,
    totalSlots,
    slotWidth: sw,
    isSlotBooked,
    isSlotFullyBooked,
    onDragComplete: (startIso, endIso) =>
      onSelectRange?.(language.language.id, startIso, endIso),
  })

  const overlapRowTitle =
    omitBookedSlotBlocks && bookedSlots.length
      ? t('calendar.parallel_bookings_expand', { count: bookedSlots.length })
      : undefined

  return (
    <div className={classes.rowWrapper} title={overlapRowTitle}>
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
        {onToggleExpand && (
          <button
            className={classNames(classes.collapseBtn, {
              [classes.collapseBtnExpanded]: isExpanded ?? language.pinned,
            })}
            onClick={onToggleExpand}
            aria-label={t('calendar.expand_row')}
          >
            <SmallArrowIcon className={classes.collapseIcon} />
          </button>
        )}
      </div>

      <div
        ref={rowRef}
        className={classes.slotArea}
        style={{ width: totalWidth }}
        onMouseDown={readOnly ? undefined : handleMouseDown}
        onMouseMove={readOnly ? undefined : handleMouseMove}
        onMouseUp={readOnly ? undefined : handleMouseUp}
        onMouseLeave={readOnly ? undefined : handleMouseUp}
      >
        {/* Slot background cells */}
        {!isExpanded && !readOnly && (
          <CalendarSlotCells
            totalSlots={totalSlots}
            date={date}
            dayStartHour={dayStartHour}
            slotWidth={sw}
            isSlotBooked={isSlotBooked}
            isSlotFullyBooked={isSlotFullyBooked}
          />
        )}

        {/* Drag selection highlight */}
        {!isExpanded && !readOnly && isDragging && (
          <div
            className={classes.selectionHighlight}
            style={{ left: selectionLeft, width: selectionWidth }}
          />
        )}

        {/* Collapsed client row: show where parallel bookings overlap */}
        {!isExpanded &&
          omitBookedSlotBlocks &&
          overlapCollapsedIntervals.map((r, idx) => {
            const left = timeToX(r.start_at, dayStartHour, sw)
            const w = durationToWidth(r.start_at, r.end_at, sw)
            const innerW = Math.max(w - 8, 16)
            return (
              <div
                key={`overlap-${r.start_at}-${r.end_at}-${idx}`}
                className={classes.overlapCollapsedStrip}
                style={{ left: left + 4, width: innerW }}
                title={overlapRowTitle}
                aria-label={t('calendar.overlaps_short')}
              >
                {innerW >= sw * 0.5 && (
                  <span className={classes.overlapCollapsedLabel}>
                    {t('calendar.overlaps_short')}
                  </span>
                )}
              </div>
            )
          })}

        {/* Booked slot blocks */}
        {!isExpanded &&
          !omitBookedSlotBlocks &&
          bookedSlots.map((slot, idx) => (
            <BookedSlotBlock
              key={`${slot.start_at}-${slot.type}-${idx}`}
              slot={slot}
              dayStartHour={dayStartHour}
              onClick={onClickSlot}
              alwaysLightBlue={readOnly}
              slotWidth={sw}
              rowWidth={totalWidth}
            />
          ))}
      </div>
    </div>
  )
}

export default CalendarLanguageRow
