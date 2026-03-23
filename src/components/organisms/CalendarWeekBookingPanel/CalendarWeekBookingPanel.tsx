import { FC } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useFetchWeekSlotBookings } from 'hooks/requests/useCalendar'
import CloseIcon from 'assets/icons/close.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

const CalendarWeekBookingPanel: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { weekBookingPanel, closeWeekBookingPanel } = useCalendarPanel()
  const { bookings, isLoading } = useFetchWeekSlotBookings(weekBookingPanel)

  const isOpen = weekBookingPanel !== null

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
          {isLoading ? (
            <div className={classes.loading}>...</div>
          ) : bookings.length === 0 ? (
            <div className={classes.empty}>{t('calendar.no_bookings')}</div>
          ) : (
            bookings.map((booking) => (
              <button
                key={booking.id}
                className={classes.bookingItem}
                onClick={() => navigate(`/calendar/${booking.id}`)}
              >
                <div className={classes.bookingInfo}>
                  <span className={classes.bookingId}>{booking.ext_id}</span>
                </div>
                <ChevronLeft className={classes.chevron} />
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default CalendarWeekBookingPanel
