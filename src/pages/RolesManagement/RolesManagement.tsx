import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import RolesTabs from 'components/organisms/RolesTabs/RolesTabs'

// TODO: WIP - implement this page

const RolesManagement: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <h1>{t('roles.roles_management')}</h1>
      <RolesTabs />
    </>
  )
}

export default RolesManagement
