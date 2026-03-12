import { FC, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import AlarmIcon from 'assets/icons/alarm.svg?react'
import ClockIcon from 'assets/icons/clock.svg?react'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import { formatDuration } from 'helpers/calendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useDeclineCalendarOrder } from 'hooks/requests/useCalendar'
import classes from './classes.module.scss'

interface Props {
  slot: BookedSlot
  language: CalendarLanguage
}

function formatCountdown(startIso: string): string {
  const diff = dayjs(startIso).diff(dayjs(), 'second')
  if (diff <= 0) return '00:00'
  const totalMinutes = Math.floor(diff / 60)
  const seconds = diff % 60
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }
  return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const CalendarTranslatorNotification: FC<Props> = ({ slot, language }) => {
  const { t } = useTranslation()
  const { openSidePanel } = useCalendarContext()
  const { mutate: declineOrder, isPending } = useDeclineCalendarOrder()
  const [countdown, setCountdown] = useState(() => formatCountdown(slot.start_at))

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(slot.start_at))
    }, 1000)
    return () => clearInterval(timer)
  }, [slot.start_at])

  const projectId = slot.assignment?.sub_project?.id
  const extId = slot.assignment?.sub_project?.ext_id ?? ''
  const date = dayjs(slot.start_at).isSame(dayjs(), 'day')
    ? t('calendar.today')
    : dayjs(slot.start_at).format('DD.MM.YYYY')
  const startTime = dayjs(slot.start_at).format('HH:mm')
  const duration = formatDuration(slot.start_at, slot.end_at)

  const handleDecline = () => {
    if (!projectId) return
    declineOrder(projectId)
  }

  const handleView = () => {
    openSidePanel({
      language,
      startIso: slot.start_at,
      endIso: slot.end_at,
      slot,
      intent: 'accept',
    })
  }

  return (
    <div className={classes.bar}>
      <AlarmIcon className={classes.icon} />
      <div className={classes.details}>
        <span className={classes.detailText}>{extId}</span>
        <span className={classes.detailText}>{date}</span>
        <span className={classes.detailText}>
          {t('calendar.notification_start')} {startTime}
        </span>
        <span className={classes.detailText}>
          {t('calendar.duration')}: {duration}
        </span>
      </div>
      <div className={classes.actions}>
        <div className={classes.countdown}>
          <ClockIcon className={classes.countdownIcon} />
          <span className={classes.countdownText}>{countdown}</span>
        </div>
        <button className={classes.rejectBtn} onClick={handleDecline} disabled={isPending}>
          {t('calendar.decline')}
        </button>
        <button className={classes.viewBtn} onClick={handleView}>
          {t('calendar.view_order')}
        </button>
      </div>
    </div>
  )
}

export default CalendarTranslatorNotification
