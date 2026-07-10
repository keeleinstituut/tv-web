import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarDay } from 'components/contexts/CalendarDayContext'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import { BookedSlotBlock } from 'components/molecules/CalendarLanguageRow/CalendarLanguageRow'
import CalendarVendorBadge from 'components/atoms/CalendarVendorBadge/CalendarVendorBadge'
import classes from './classes.module.scss'

interface Props {
  slots: BookedSlot[]
  language: CalendarLanguage
}

const CalendarDayUnassignedRow: FC<Props> = ({ slots, language }) => {
  const { t } = useTranslation()
  const { dayStartHour, dayEndHour, slotWidth: sw } = useCalendarDay()
  const { openSidePanel } = useCalendarPanel()
  const totalWidth = (dayEndHour - dayStartHour) * 2 * sw

  const handleClickSlot = useCallback(
    (slot: BookedSlot) => {
      openSidePanel({
        language,
        startIso: slot.start_at,
        endIso: slot.end_at,
        slot,
      })
    },
    [language, openSidePanel]
  )

  return (
    <div className={classes.vendorRowWrapper}>
      <div className={classes.vendorLabel}>
        <CalendarVendorBadge name={t('calendar.no_vendor')} unassigned />
      </div>
      <div className={classes.slotArea} style={{ width: totalWidth }}>
        {slots.map((slot) => (
          <BookedSlotBlock
            key={`${slot.start_at}-${slot.assignment?.id}`}
            slot={slot}
            dayStartHour={dayStartHour}
            onClick={handleClickSlot}
            slotWidth={sw}
            rowWidth={totalWidth}
            alwaysViolet
          />
        ))}
      </div>
    </div>
  )
}

export default CalendarDayUnassignedRow
