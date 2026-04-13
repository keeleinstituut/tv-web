import { FC, useRef } from 'react'
import { useCalendarDay } from 'components/contexts/CalendarDayContext'
import { useSlotStateCheckers } from 'hooks/useSlotStateCheckers'
import { BookedSlotBlock } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import CalendarSlotCells from 'components/molecules/CalendarSlotCells/CalendarSlotCells'
import langClasses from 'components/molecules/CalendarLanguageRow/classes.module.scss'
import { useDragSelection } from 'hooks/useDragSelection'
import type { BookedSlot, CalendarLanguage } from 'types/calendar'

interface Props {
  language: CalendarLanguage
  /** Slots packed onto this row (non-overlapping) */
  rowSlots: BookedSlot[]
  /** All bookings for the language (for blocking drag / cell state) */
  allBookedSlots: BookedSlot[]
  langAvailSlots?: Array<{ start_at: string; end_at: string }>
  onSelectRange?: (langId: string, startIso: string, endIso: string) => void
  onClickSlot?: (slot: BookedSlot) => void
}

const CalendarDayClientBookingRow: FC<Props> = ({
  language,
  rowSlots,
  allBookedSlots,
  langAvailSlots,
  onSelectRange,
  onClickSlot,
}) => {
  const { date, dayStartHour, dayEndHour, slotWidth: sw } = useCalendarDay()
  const totalSlots = (dayEndHour - dayStartHour) * 2
  const totalWidth = totalSlots * sw
  const rowRef = useRef<HTMLDivElement>(null)

  const { isSlotBooked, isSlotFullyBooked } = useSlotStateCheckers(
    date,
    dayStartHour,
    allBookedSlots,
    langAvailSlots
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


  return (
    <div className={langClasses.rowWrapper}>
      <div className={langClasses.label}>
        <span className={langClasses.badge}>
          {language.language.value.split('-')[0]}
        </span>
      </div>
      <div
        ref={rowRef}
        className={langClasses.slotArea}
        style={{ width: totalWidth }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CalendarSlotCells
            totalSlots={totalSlots}
            date={date}
            dayStartHour={dayStartHour}
            slotWidth={sw}
            isSlotBooked={isSlotBooked}
            isSlotFullyBooked={isSlotFullyBooked}
          />
        {isDragging && (
          <div
            className={langClasses.selectionHighlight}
            style={{ left: selectionLeft, width: selectionWidth }}
          />
        )}
        {rowSlots.map((slot, idx) => (
          <BookedSlotBlock
            key={`${slot.start_at}-${slot.end_at}-${idx}`}
            slot={slot}
            dayStartHour={dayStartHour}
            onClick={onClickSlot}
            alwaysLightBlue={false}
            slotWidth={sw}
            rowWidth={totalWidth}
          />
        ))}
      </div>
    </div>
  )
}

export default CalendarDayClientBookingRow
