import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { getInitials } from 'helpers/calendar'
import classes from './classes.module.scss'

interface Props {
  vendorId: string
  name: string
  isEmo?: boolean
}

const CalendarVendorBadge: FC<Props> = ({ vendorId, name, isEmo }) => {
  const navigate = useNavigate()
  const handleNavigate = () => navigate(`/vendors/${vendorId}`)
  return (
    <span
      className={classNames(classes.badge, { [classes.badgeEmo]: isEmo })}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNavigate()
        }
      }}
      role="button"
      tabIndex={0}
    >
      {getInitials(name)}
      {isEmo && <span className={classes.emoLabel}>EMO</span>}
    </span>
  )
}

export default CalendarVendorBadge
