import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import AddIcon from 'assets/icons/add.svg?react'
import classes from './classes.module.scss'

interface Props {
  weekCount?: number
  weekColWidth?: number
}

const CalendarAddVendorRow: FC<Props> = ({ weekCount = 0, weekColWidth }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className={classes.addVendorRow}>
      <div className={classes.addVendorLabel}>
        <button
          className={classes.addVendorBtn}
          aria-label={t('calendar.add_translator')}
          onClick={() => navigate('/vendors')}
        >
          <AddIcon className={classes.addVendorIcon} />
        </button>
      </div>
      {Array.from({ length: weekCount + 1 }).map((_, i) => (
        <div
          key={i}
          className={classes.addVendorCell}
          style={{ width: weekColWidth, minWidth: weekColWidth }}
        />
      ))}
    </div>
  )
}

export default CalendarAddVendorRow
