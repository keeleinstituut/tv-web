import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import landingBackground from 'assets/landing_background.svg'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'

import classes from './styles.module.scss'

const LandingContent = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  return (
    <div className={classes.container}>
      <div className={classes.whiteBackground} />
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
    </div>
  )
}

export default LandingContent
