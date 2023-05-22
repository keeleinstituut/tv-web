import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import useAuth from 'hooks/useAuth'

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const { userInfo, login, isUserLoggedIn } = useAuth()
  return (
    <>
      <div />
      <div>
        {userInfo && isUserLoggedIn ? (
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        ) : (
          <button onClick={login}>{t('button.login')}</button>
        )}
      </div>
    </>
  )
}

export default Dashboard
