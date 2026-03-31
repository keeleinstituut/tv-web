import { FC, useMemo } from 'react'
import CalendarDayClientBookingRow from './CalendarDayClientBookingRow'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { mergeClientPrebookSlot, sortBookedSlotsByStart } from 'helpers/calendarDayOverlaps'
import type { BookedSlot, CalendarDayResponse, CalendarLanguage } from 'types/calendar'

interface Props {
  language: CalendarLanguage
  date: string
  dayStartHour: number
  dayEndHour: number
  slotWidth: number
  dayData?: CalendarDayResponse
  onSelectRange?: (langId: string, startIso: string, endIso: string) => void
  onClickSlot?: (slot: BookedSlot) => void
}

const CalendarDayClientBookingRows: FC<Props> = ({
  language,
  date,
  dayStartHour,
  dayEndHour,
  slotWidth,
  dayData,
  onSelectRange,
  onClickSlot,
}) => {
  const { sidePanelSelection } = useCalendarPanel()

  const rawSlots =
    dayData?.booked_slots_by_language?.[language.language.id] ?? []

  const allBookedSlots = useMemo(
    () => mergeClientPrebookSlot(language, rawSlots, sidePanelSelection),
    [language, rawSlots, sidePanelSelection]
  )

  const sorted = useMemo(
    () => sortBookedSlotsByStart(allBookedSlots),
    [allBookedSlots]
  )

  const langAvailSlots =
    dayData?.available_slots_by_language?.[language.language.id]

  return (
    <>
      {sorted.map((rowSlot, idx) => (
        <CalendarDayClientBookingRow
          key={`${language.language.id}-expanded-${idx}-${rowSlot.start_at}-${rowSlot.end_at}`}
          language={language}
          date={date}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
          slotWidth={slotWidth}
          rowSlot={rowSlot}
          allBookedSlots={allBookedSlots}
          langAvailSlots={langAvailSlots}
          onSelectRange={onSelectRange}
          onClickSlot={onClickSlot}
        />
      ))}
    </>
  )
}

export default CalendarDayClientBookingRows
