import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

/** Calendar roles derived from privileges. */
export interface CalendarRole {
  isTPM: boolean
  /** Vendor / teostaja — same role as “translator” in calendar UI copy. */
  isTranslator: boolean
  isClient: boolean
}

export function useCalendarRole(): CalendarRole {
  const { userPrivileges } = useAuth()
  const isTPM = userPrivileges.includes(Privileges.ManageProject)
  const isTranslator =
    !isTPM && userPrivileges.includes(Privileges.ReceiveProject)
  const isClient =
    !isTPM && !isTranslator && userPrivileges.includes(Privileges.CreateProject)
  return { isTPM, isTranslator, isClient }
}
