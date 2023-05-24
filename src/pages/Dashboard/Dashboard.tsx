import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import LandingContent from 'components/organisms/LandingContent/LandingContent'
import classes from './styles.module.scss'

import useAuth from 'hooks/useAuth'

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const { userInfo, login, isUserLoggedIn } = useAuth()
  return (
    <>
      <LandingContent className={classes.landingContent} />
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
