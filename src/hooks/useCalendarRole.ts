import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

export interface CalendarRole {
  isTPM: boolean
  isTranslator: boolean
  isClient: boolean
}

export function useCalendarRole(): CalendarRole {
  const { userPrivileges } = useAuth()

  const isClient = userPrivileges.includes(Privileges.CreateProject)
  const isTPM = userPrivileges.includes(Privileges.ManageProject)
  const isTranslator = userPrivileges.includes(Privileges.ReceiveProject)
  return { isTPM, isTranslator, isClient }
}
