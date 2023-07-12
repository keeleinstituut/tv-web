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

const UsersManagement: FC = () => {
  const {
    users,
    paginationData,
    handelFilterChange,
    handelSortingChange,
    handlePaginationChange,
  } = useFetchUsers()
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { downloadCSV, isLoading } = useDownloadUsers()

  const handelDownloadFile = () => {
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
            [classes.invisible]: !includes(userPrivileges, 'EXPORT_USER'),
          })}
          onClick={handelDownloadFile}
          disabled={!includes(userPrivileges, 'EXPORT_USER')}
          loading={isLoading}
        >
          {t('button.export_csv')}
        </Button>
        <Button href="/settings/users/add">{t('button.add_users')}</Button>
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
