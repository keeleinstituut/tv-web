import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import useAuth from 'hooks/useAuth'

const Test: FC = () => {
  const { t } = useTranslation()
  const { userId, login, isUserLoggedIn } = useAuth()

  return (
    <>
      <div />
      <div>
        {userId && isUserLoggedIn ? (
          <pre>{JSON.stringify(userId, null, 2)}</pre>
        ) : (
          <button onClick={login}>{t('button.login')}</button>
        )}
      </div>
    </>
  )
}

export default Test
