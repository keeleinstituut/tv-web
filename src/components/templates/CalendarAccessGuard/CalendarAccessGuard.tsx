import { FC, PropsWithChildren } from 'react'
import { useCalendarRole } from 'hooks/useCalendarRole'

/** Same copy as PageNotFound when not under a route error boundary. */
const NotFoundMessage: FC = () => (
  <div>
    <h1>This page is not found</h1>
  </div>
)

const CalendarAccessGuard: FC<PropsWithChildren> = ({ children }) => {
  const { isTPM, isTranslator, isClient } = useCalendarRole()
  if (!isTPM && !isTranslator && !isClient) {
    return <NotFoundMessage />
  }
  return <>{children}</>
}

export default CalendarAccessGuard
