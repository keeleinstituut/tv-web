import { FC, useState } from 'react'
import { DEV_ROLE_KEY, DevCalendarRole } from 'hooks/useCalendarRole'
import classes from './classes.module.scss'

const ROLES: { key: DevCalendarRole; label: string }[] = [
  { key: 'tpm', label: 'TPM' },
  { key: 'client', label: 'Tellija' },
  { key: 'translator', label: 'Teostaja' },
]

const CalendarDevRoleSelector: FC = () => {
  const stored = localStorage.getItem(DEV_ROLE_KEY) as DevCalendarRole | null
  const [current, setCurrent] = useState<DevCalendarRole>(stored ?? 'tpm')

  const handleSelect = (role: DevCalendarRole) => {
    localStorage.setItem(DEV_ROLE_KEY, role)
    setCurrent(role)
    window.location.reload()
  }

  return (
    <div className={classes.panel}>
      <span className={classes.label}>DEV role</span>
      <div className={classes.buttons}>
        {ROLES.map(({ key, label }) => (
          <button
            key={key}
            className={current === key ? classes.btnActive : classes.btn}
            onClick={() => handleSelect(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CalendarDevRoleSelector
