import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useDownloadUsers } from 'hooks/requests/useUsers'
import { useTranslation } from 'react-i18next'
import { FC } from 'react'
import AddedUsersTable from 'components/organisms/tables/AddedUsersTable/AddedUsersTable'
import classes from './classes.module.scss'
import { includes } from 'lodash'
import classNames from 'classnames'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

const UsersManagement: FC = () => {
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
        <Tooltip helpSectionKey="usersManagement" />
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
      <AddedUsersTable />
    </>
  )
}

export default UsersManagement
