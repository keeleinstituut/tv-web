import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { useTranslation } from 'react-i18next'
import { FC } from 'react'
import AddedUsersTable from 'components/organisms/tables/AddedUsersTable/AddedUsersTable'
import classes from './classes.module.scss'
import { isEmpty, includes } from 'lodash'
import classNames from 'classnames'
import { Root } from '@radix-ui/react-form'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import UserManagementCheatSheet from 'components/molecules/cheatSheets/UserManagementCheatSheet'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'

const UsersManagement: FC = () => {
  const {
    users,
    paginationData,
    handelFilterChange,
    handelSortingChange,
    handlePaginationChange,
  } = useFetchUsers()
  const { userPrivileges } = useAuth()
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.userManagementHeader}>
        <h1>{t('users.user_management')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          modalContent={<UserManagementCheatSheet />}
        />
        <Button
          // href="/settings/users/add"
          appearance={AppearanceTypes.Secondary}
          className={classNames({ [classes.invisible]: isEmpty(users) })}
        >
          {t('button.export_csv')}
        </Button>
        <Button
          href="/settings/users/add"
          hidden={!includes(userPrivileges, Privileges.AddUser)}
        >
          {t('button.add_users')}
        </Button>
      </div>
      {/* TODO: remove this form root wrapper, once we refactor CheckBox */}
      <Root>
        <AddedUsersTable
          data={users}
          paginationData={paginationData}
          hidden={isEmpty(users)}
          handelFilterChange={handelFilterChange}
          handelSortingChange={handelSortingChange}
          handlePaginationChange={handlePaginationChange}
        />
      </Root>
    </>
  )
}

export default UsersManagement
