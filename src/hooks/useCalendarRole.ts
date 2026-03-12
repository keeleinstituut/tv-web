import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

export type DevCalendarRole = 'tpm' | 'client' | 'translator'
export const DEV_ROLE_KEY = 'dev_calendar_role'

export interface CalendarRole {
  isTPM: boolean
  isTranslator: boolean
  isClient: boolean
}

export function useCalendarRole(): CalendarRole {
  const { userPrivileges } = useAuth()

  const devRole = localStorage.getItem(DEV_ROLE_KEY) as DevCalendarRole | null
  if (devRole) {
    return {
      isTPM: devRole === 'tpm',
      isTranslator: devRole === 'translator',
      isClient: devRole === 'client',
    }
  }

  const isTPM = userPrivileges.includes(Privileges.ManageProject)
  const isTranslator =
    !isTPM && userPrivileges.includes(Privileges.ReceiveProject)
  const isClient = !isTPM && !isTranslator
  return { isTPM, isTranslator, isClient }
}
