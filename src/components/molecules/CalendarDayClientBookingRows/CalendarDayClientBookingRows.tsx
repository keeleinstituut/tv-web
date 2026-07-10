import { FC, useMemo } from 'react'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { mergeClientPrebookSlot, sortBookedSlotsByStart, packSlotsIntoRows } from 'helpers/calendarDayOverlaps'
import CalendarDayClientBookingRow from './CalendarDayClientBookingRow'
import type { BookedSlot, CalendarDayResponse, CalendarLanguage } from 'types/calendar'

interface Props {
  language: CalendarLanguage
  dayData?: CalendarDayResponse
  readOnly?: boolean
  onSelectRange?: (langId: string, startIso: string, endIso: string) => void
  onClickSlot?: (slot: BookedSlot) => void
}

const CalendarDayClientBookingRows: FC<Props> = ({
  language,
  dayData,
  readOnly,
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

  const rows = useMemo(
    () => packSlotsIntoRows(sortBookedSlotsByStart(allBookedSlots)),
    [allBookedSlots]
  )

  const langAvailSlots = dayData?.available_slots_by_language
    ? (dayData.available_slots_by_language[language.language.id] ?? [])
    : undefined

  return (
    <>
      {rows.map((rowSlots, idx) => (
        <CalendarDayClientBookingRow
          key={`${language.language.id}-row-${idx}`}
          language={language}
          rowSlots={rowSlots}
          allBookedSlots={allBookedSlots}
          langAvailSlots={langAvailSlots}
          readOnly={readOnly}
          onSelectRange={onSelectRange}
          onClickSlot={onClickSlot}
        />
      ))}
    </>
  )
}

export default CalendarDayClientBookingRows
