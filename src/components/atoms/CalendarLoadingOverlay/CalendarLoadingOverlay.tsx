import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'

interface Props {
  searching?: boolean
}

const CalendarLoadingOverlay: FC<Props> = ({ searching = false }) => {
  const { t } = useTranslation()
  const titleKey = searching
    ? 'calendar.searching_overlay_title'
    : 'calendar.loading_overlay_title'
  const subtitleKey = searching
    ? 'calendar.searching_overlay_subtitle'
    : 'calendar.loading_overlay_subtitle'
  return (
    <div className={classes.overlay}>
      <div className={classes.content}>
        <p className={classes.title}>{t(titleKey)}</p>
        <p className={classes.subtitle}>{t(subtitleKey)}</p>
      </div>
    </div>
  )
}

export default CalendarLoadingOverlay
