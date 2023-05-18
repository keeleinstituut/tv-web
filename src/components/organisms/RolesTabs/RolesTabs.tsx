import { FC } from 'react'
import classes from './styles.module.scss'
import logo from 'assets/logo.svg'
import { useTranslation } from 'react-i18next'
import LanguageChanger from 'components/molecules/LanguageChanger/LanguageChanger'
import UserRoleSection from 'components/molecules/UserRoleSection/UserRoleSection'
import useAuth from 'hooks/useAuth'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'

const RolesTabs: FC = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  return <div>{/* <Tabs /> */}</div>
}

export default RolesTabs
