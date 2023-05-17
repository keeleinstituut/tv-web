import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import useAuth from 'hooks/useAuth'

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const { userId, login, isUserLoggedIn, token } = useAuth()
  console.warn('token', token)
  return (
    <>
      <div />
      <div>
        <p>{`token: ${token}`}</p>
        {userId && isUserLoggedIn ? (
          <pre>{JSON.stringify(userId, null, 2)}</pre>
        ) : (
          <button onClick={login}>{t('button.login')}</button>
        )}
      </div>
    </>
  )
}

export default Dashboard
