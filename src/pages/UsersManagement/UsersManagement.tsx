import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useDownloadUsers, useFetchUsers } from 'hooks/requests/useUsers'
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
import { UserStatus } from 'types/users'
import Loader from 'components/atoms/Loader/Loader'

const UsersManagement: FC = () => {
  const initialFilters = {
    statuses: [UserStatus.Active, UserStatus.Deactivated],
  }
  const {
    users,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
    isLoading: isUsersLoading,
  } = useFetchUsers(initialFilters)
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { downloadCSV, isLoading } = useDownloadUsers()

  const handleDownloadFile = () => {
    downloadCSV()
  }

  return (
    <>
      <div className={classes.userManagementHeader}>
        <h1>{t('users.user_management')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          modalContent={<UserManagementCheatSheet />}
        />
        <Button
          appearance={AppearanceTypes.Secondary}
          className={classNames({
            [classes.invisible]: !includes(
              userPrivileges,
              Privileges.ExportUser
            ),
          })}
          onClick={handleDownloadFile}
          disabled={!includes(userPrivileges, Privileges.ExportUser)}
          loading={isLoading}
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
        <Loader loading={isUsersLoading && isEmpty(users)} />
        <AddedUsersTable
          data={users}
          paginationData={paginationData}
          handleFilterChange={handleFilterChange}
          handleSortingChange={handleSortingChange}
          handlePaginationChange={handlePaginationChange}
        />
      </Root>
    </>
  )
}

export default UsersManagement
