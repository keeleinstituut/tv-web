import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import landingBackground from 'assets/landing_background.svg'
import sponsorLogo from 'assets/sponsor-logo.jpg'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'components/contexts/AuthContext'
import { FC } from 'react'
import classNames from 'classnames'

import classes from './classes.module.scss'
import { includes } from 'lodash'
import { Privileges } from 'types/privileges'

interface LandingContentProps {
  className?: string
}

const LandingContent: FC<LandingContentProps> = ({ className }) => {
  const { t } = useTranslation()
  const { login, isUserLoggedIn, userPrivileges } = useAuth()
  return (
    <>
      <div className={classNames(classes.container, className)}>
        <div className={classes.whiteBackground} />
        <img
          src={landingBackground}
          className={classes.background}
          alt="Landing background"
        />
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
              hidden={
                isUserLoggedIn &&
                !includes(userPrivileges, Privileges.CreateProject)
              }
              className={classes.button}
            />
          </div>
          <h4 hidden={isUserLoggedIn} className={classes.text}>
            {t('landing.machine_translation_text')}
          </h4>
          <Button
            appearance={AppearanceTypes.Primary}
            children={t('button.click_here')}
            href={'https://mtee.eki.ee/'}
            target="_blank"
            size={SizeTypes.S}
            hidden={isUserLoggedIn}
          />
        </div>
      </div>
      <img
        src={sponsorLogo}
        className={classes.logo}
        alt="Euroopa Regionaalarengu Fond"
      />
    </>
  )
}

export default LandingContent
