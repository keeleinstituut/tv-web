import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

export interface CalendarRole {
  isTPM: boolean
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
