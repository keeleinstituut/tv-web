import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { useRolesFetch } from 'hooks/requests/useRoles'

import { useTranslation } from 'react-i18next'
import { FC } from 'react'
import AddedUsersTable from 'components/templates/Tables/AddedUsersTable/AddedUsersTable'
import classes from './styles.module.scss'
import { isEmpty, map } from 'lodash'
import classNames from 'classnames'

const UsersManagement: FC = () => {
  const { users } = useFetchUsers()
  const { existingRoles = [] } = useRolesFetch()
  const { t } = useTranslation()

  console.log('rollid', existingRoles)
  const rolesFilterOptions = map(existingRoles, ({ id, name }) => {
    return { value: id, label: name }
  })

  console.log(rolesFilterOptions)
  return (
    <>
      <div className={classes.userManagementHeader}>
        <h1>{t('menu.user_management')}</h1>
        {/*  {// TODO: add toolTip here  */}
        <p className={classes.toolTip}>?</p>
        <Button
          // href="/settings/users/add"
          appearance={AppearanceTypes.Secondary}
          className={classNames({ [classes.invisible]: isEmpty(users) })}
        >
          {t('button.export_csv')}
        </Button>
        <Button href="/settings/users/add">{t('button.add_users')}</Button>
      </div>
      <AddedUsersTable data={users} hidden={isEmpty(users)} />
    </>
  )
}

export default UsersManagement
