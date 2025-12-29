import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSessions, useInvalidateSession } from 'hooks/requests/useSessions'
import { useAuth } from 'components/contexts/AuthContext'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import Loader from 'components/atoms/Loader/Loader'
import Container from 'components/atoms/Container/Container'
import dayjs from 'dayjs'
import classes from './classes.module.scss'

const SessionManagement: FC = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useSessions()
  const invalidateSessionMutation = useInvalidateSession()
  const { logout } = useAuth()

  const handleInvalidateSession = useCallback(
    async (sessionId: string, isCurrent: boolean) => {
      if (isCurrent) {
        logout()
      } else {
        await invalidateSessionMutation.mutateAsync(sessionId)
      }
    },
    [invalidateSessionMutation, logout]
  )

  if (isLoading) {
    return <Loader loading={isLoading} />
  }

  const sessions = data?.sessions || []

  return (
    <>
      <h3 className={classes.title}>{t('sessions.active_sessions')}</h3>
      <Container className={classes.container}>
        {sessions.length === 0 ? (
          <p className={classes.emptyMessage}>
            {t('sessions.no_active_sessions')}
          </p>
        ) : (
          <table className={classes.sessionsTable}>
            <thead>
              <tr>
                <th>{t('sessions.device_browser')}</th>
                <th>{t('sessions.ip_address')}</th>
                <th>{t('sessions.last_access')}</th>
                <th>{t('sessions.status')}</th>
                <th>{t('sessions.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId}>
                  <td>{session.userAgent || t('sessions.unknown')}</td>
                  <td>{session.ipAddress || t('sessions.unknown')}</td>
                  <td>
                    {session.lastAccess
                      ? dayjs(session.lastAccess).format('DD.MM.YYYY HH:mm')
                      : t('sessions.unknown')}
                  </td>
                  <td>
                    {session.isCurrent
                      ? t('sessions.current_session')
                      : t('sessions.active')}
                  </td>
                  <td>
                    <Button
                      appearance={AppearanceTypes.Secondary}
                      onClick={() =>
                        handleInvalidateSession(
                          session.sessionId,
                          session.isCurrent
                        )
                      }
                      disabled={invalidateSessionMutation.isLoading}
                    >
                      {session.isCurrent
                        ? t('sessions.logout')
                        : t('sessions.revoke')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Container>
    </>
  )
}

export default SessionManagement
