import { FC } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import CheckIcon from 'assets/icons/check.svg?react'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import { formatDuration } from 'helpers/calendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import classes from './classes.module.scss'

interface Props {
  slot: BookedSlot
  language: CalendarLanguage
}

const CalendarClientNotification: FC<Props> = ({ slot, language }) => {
  const { t } = useTranslation()
  const { openSidePanel } = useCalendarContext()

  const extId = slot.assignment?.sub_project?.ext_id ?? ''
  const date = dayjs(slot.start_at).isSame(dayjs(), 'day')
    ? t('calendar.today')
    : dayjs(slot.start_at).format('DD.MM.YYYY')
  const startTime = dayjs(slot.start_at).format('HH:mm')
  const duration = formatDuration(slot.start_at, slot.end_at)

  const handleView = () => {
    openSidePanel({ language, startIso: slot.start_at, endIso: slot.end_at, slot })
  }

  return (
    <div className={classes.bar}>
      <CheckIcon className={classes.icon} />
      <div className={classes.details}>
        <span className={classes.detailText}>
          {t('calendar.order_confirmed_notification', { id: extId })}
        </span>
        <span className={classes.detailText}>{date}</span>
        <span className={classes.detailText}>
          {t('calendar.notification_start')} {startTime}
        </span>
        <span className={classes.detailText}>
          {t('calendar.duration')}: {duration}
        </span>
      </div>
      <div className={classes.actions}>
        <button className={classes.viewBtn} onClick={handleView}>
          {t('calendar.view_order')}
        </button>
      </div>
    </div>
  )
}

export default CalendarClientNotification
