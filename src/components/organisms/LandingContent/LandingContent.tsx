import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import landingBackground from 'assets/landing_background.svg'
import { useTranslation } from 'react-i18next'
import useAuth from 'hooks/useAuth'
import { FC } from 'react'
import classNames from 'classnames'

import classes from './classes.module.scss'

interface LandingContentProps {
  className?: string
}

const LandingContent: FC<LandingContentProps> = ({ className }) => {
  const { t } = useTranslation()
  const { login, isUserLoggedIn } = useAuth()
  return (
    <div className={classNames(classes.container, className)}>
      <div className={classes.whiteBackground} />
      <img src={landingBackground} alt="Landing background" />
      <div className={classes.contentContainer}>
        <h1>{t('landing.site_description')}</h1>

        <div className={classes.buttonsContainer}>
          <Button
            appearance={AppearanceTypes.Secondary}
            children={t('button.check_tutorial')}
            href={isUserLoggedIn ? '/manual' : undefined}
            className={classes.bigButton}
            hidden={!isUserLoggedIn}
          />
          <Button
            appearance={AppearanceTypes.Primary}
            children={
              isUserLoggedIn ? t('button.add_new_project') : t('button.enter')
            }
            href={isUserLoggedIn ? '/projects/new-project' : undefined}
            onClick={isUserLoggedIn ? undefined : login}
            className={classes.button}
          />
        </div>
      </div>
    </div>
  )
}

export default LandingContent
