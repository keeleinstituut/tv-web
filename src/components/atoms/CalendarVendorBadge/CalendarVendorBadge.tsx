import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { getInitials } from 'helpers/calendar'
import classes from './classes.module.scss'

interface Props {
  vendorId?: string
  name: string
  isEmo?: boolean
  unassigned?: boolean
}

const CalendarVendorBadge: FC<Props> = ({ vendorId, name, isEmo, unassigned }) => {
  const navigate = useNavigate()
  const handleNavigate = vendorId
    ? () => navigate(`/vendors/${vendorId}`)
    : undefined
  return (
    <span
      className={classNames(classes.badge, {
        [classes.badgeEmo]: isEmo,
        [classes.badgeUnassigned]: unassigned,
      })}
      onClick={handleNavigate}
      onKeyDown={
        handleNavigate
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleNavigate()
              }
            }
          : undefined
      }
      role={handleNavigate ? 'button' : undefined}
      tabIndex={handleNavigate ? 0 : undefined}
    >
      {getInitials(name)}
      {isEmo && <span className={classes.emoLabel}>EMO</span>}
      <span className={classes.tooltip}>{name}</span>
    </span>
  )
}

export default CalendarVendorBadge
