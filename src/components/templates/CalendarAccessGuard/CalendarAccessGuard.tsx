import { FC, PropsWithChildren } from 'react'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useAuth } from 'components/contexts/AuthContext'

/** Same copy as PageNotFound when not under a route error boundary. */
const NotFoundMessage: FC = () => (
  <div>
    <h1>This page is not found</h1>
  </div>
)

const CalendarAccessGuard: FC<PropsWithChildren> = ({ children }) => {
  const { isTranslationAgency } = useAuth()
  const { isTPM, isTranslator, isClient, isLoading } = useCalendarRole()
  if (isLoading) return null
  if (isTranslationAgency || (!isTPM && !isTranslator && !isClient)) {
    return <NotFoundMessage />
  }
  return <>{children}</>
}

export default CalendarAccessGuard
