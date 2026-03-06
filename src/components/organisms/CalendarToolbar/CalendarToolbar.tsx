import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import CalendarIcon from 'assets/icons/calender.svg?react'
import HorizontalDotsIcon from 'assets/icons/horizontal_dots.svg?react'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { CalendarView } from 'types/calendar'
import classes from './classes.module.scss'
import classNames from 'classnames'

const CalendarToolbar: FC = () => {
  const { t } = useTranslation()
  const { view, setView } = useCalendarContext()

  const views: { key: CalendarView; label: string }[] = [
    { key: 'day', label: t('calendar.today') },
    { key: 'week', label: t('calendar.week') },
    { key: 'month', label: t('calendar.month') },
  ]

  return (
    <div className={classes.toolbar}>
      <div className={classes.content}>
        <div className={classes.tabs}>
          {views.map(({ key, label }) => (
            <button
              key={key}
              className={classNames(classes.tab, { [classes.tabActive]: view === key })}
              onClick={() => setView(key)}
            >
              <CalendarIcon className={classes.tabIcon} />
              {label}
            </button>
          ))}
        </div>

        <div className={classes.items} />

        <div className={classes.actions}>
          <button className={classes.moreButton}>
            {t('calendar.more')}
            <HorizontalDotsIcon className={classes.moreIcon} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalendarToolbar
