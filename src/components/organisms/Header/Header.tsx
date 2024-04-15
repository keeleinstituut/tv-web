import { FC } from 'react'
import classes from './classes.module.scss'
import logo from 'assets/logo.svg'
import { useTranslation } from 'react-i18next'
import LanguageChanger from 'components/molecules/LanguageChanger/LanguageChanger'
import UserRoleSection from 'components/molecules/UserRoleSection/UserRoleSection'
import { useAuth } from 'components/contexts/AuthContext'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'

const Header: FC = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  return (
    <header className={classes.header}>
      <img src={logo} alt={t('alt.header_logo')} />
      <div className={classes.rightSection}>
        <LanguageChanger />
        <div className={classes.separator} />
        <UserRoleSection />
        <div className={classes.separator} />
        <Button
          appearance={AppearanceTypes.Text}
          children={t('button.log_out')}
          onClick={logout}
          className={classes.logoutButton}
          size={SizeTypes.M}
        />
      </div>
    </header>
  )
}

export default Header
