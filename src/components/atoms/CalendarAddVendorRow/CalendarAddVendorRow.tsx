import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import AddIcon from 'assets/icons/add.svg?react'
import classes from './classes.module.scss'

const CalendarAddVendorRow: FC = () => {
  const { t } = useTranslation()
  return (
    <div className={classes.addVendorRow}>
      <button
        className={classes.addVendorBtn}
        aria-label={t('calendar.add_translator')}
      >
        <AddIcon className={classes.addVendorIcon} />
      </button>
    </div>
  )
}

export default CalendarAddVendorRow
