import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { BookedSlot } from 'types/calendar'
import CloseIcon from 'assets/icons/close.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

const CalendarWeekBookingPanel: FC = () => {
  const { t } = useTranslation()
  const { weekBookingPanel, closeWeekBookingPanel, openSidePanel } =
    useCalendarPanel()

  const isOpen = weekBookingPanel !== null

  const bookings = useMemo(
    () =>
      weekBookingPanel?.bookings.filter((b) => b.assignment?.sub_project?.id) ??
      [],
    [weekBookingPanel]
  )

  const handleSelect = (slot: BookedSlot) => {
    if (!weekBookingPanel || !slot.assignment?.sub_project?.id) return
    closeWeekBookingPanel()
    openSidePanel({
      language: weekBookingPanel.language,
      startIso: slot.start_at,
      endIso: slot.end_at,
      slot,
    })
  }

  return (
    <>
      {isOpen && (
        <div className={classes.backdrop} onClick={closeWeekBookingPanel} />
      )}
      <div className={`${classes.panel} ${isOpen ? classes.open : ''}`}>
        <div className={classes.header}>
          <span className={classes.headerTitle}>
            {t('calendar.select_order')}
          </span>
          <button className={classes.closeBtn} onClick={closeWeekBookingPanel}>
            {t('calendar.close')}
            <CloseIcon className={classes.closeIcon} />
          </button>
        </div>

        <div className={classes.body}>
          {bookings.length === 0 ? (
            <div className={classes.empty}>{t('calendar.no_bookings')}</div>
          ) : (
            bookings.map((slot) => {
              const extId = slot.assignment?.sub_project.ext_id ?? ''
              const key =
                slot.assignment?.id ??
                `${slot.start_at}-${slot.end_at}-${extId}`
              return (
                <button
                  key={key}
                  type="button"
                  className={classes.bookingItem}
                  onClick={() => handleSelect(slot)}
                >
                  <div className={classes.bookingInfo}>
                    <span className={classes.bookingId}>{extId}</span>
                    <span className={classes.bookingLang}>
                      {weekBookingPanel!.language.language.name}
                    </span>
                  </div>
                  <ChevronLeft className={classes.chevron} />
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

export default CalendarWeekBookingPanel
