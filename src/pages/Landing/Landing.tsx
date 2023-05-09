import { FC } from 'react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'

import classes from './styles.module.scss'
import landingBackground from 'assets/landing_background.svg'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'

const Landing: FC = () => {
  const { t } = useTranslation()
  const { login } = useAuth()

  return (
    <main className={classes.container}>
      <img src={landingBackground} alt="Landing background" />
      <div className={classes.contentContainer}>
        <h1>{t('landing.site_description')}</h1>

        <div className={classes.buttonsContainer}>
          <Button
            appearance={AppearanceTypes.Secondary}
            children={t('button.check_tutorial')}
          />
          <Button
            appearance={AppearanceTypes.Primary}
            children={t('button.enter')}
            onClick={login}
          />
        </div>
      </div>
    </main>
  )
}

export default Landing
