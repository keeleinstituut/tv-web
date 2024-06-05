import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import RolesTabs from 'components/organisms/RolesTabs/RolesTabs'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

import classes from './classes.module.scss'

const RolesManagement: FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('roles.roles_management')}</h1>
        <Tooltip helpSectionKey="roleManagement" />
      </div>
      <RolesTabs />
    </>
  )
}

export default RolesManagement
