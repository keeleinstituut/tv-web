import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInitials } from 'helpers/calendar'
import classes from './classes.module.scss'

interface Props {
  vendorId: string
  name: string
}

const CalendarVendorBadge: FC<Props> = ({ vendorId, name }) => {
  const navigate = useNavigate()
  return (
    <span
      className={classes.badge}
      onClick={() => navigate(`/vendors/${vendorId}`)}
      role="button"
      tabIndex={0}
    >
      {getInitials(name)}
    </span>
  )
}

export default CalendarVendorBadge
