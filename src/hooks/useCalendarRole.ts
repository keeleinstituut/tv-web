import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import { useFetchInstitutionUserVendor } from 'hooks/requests/useVendors'

/** Calendar roles derived from privileges and vendor status. */
export interface CalendarRole {
  isTPM: boolean
  /** Vendor / teostaja — same role as "translator" in calendar UI copy. */
  isTranslator: boolean
  isClient: boolean
  isLoading: boolean
}

export function useCalendarRole(): CalendarRole {
  const { userPrivileges, institutionUserId } = useAuth()
  const isTPM = userPrivileges.includes(Privileges.ReceiveProject)
  const isClient = !isTPM && userPrivileges.includes(Privileges.CreateProject)

  const shouldCheckVendor = !isTPM && !isClient
  const { vendor, isLoading: vendorLoading } = useFetchInstitutionUserVendor(
    shouldCheckVendor ? institutionUserId : undefined
  )
  const isTranslator = shouldCheckVendor && !!vendor
  return {
    isTPM,
    isTranslator,
    isClient,
    isLoading: shouldCheckVendor && vendorLoading,
  }
}
