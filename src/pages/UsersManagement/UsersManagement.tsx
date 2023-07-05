import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { useTranslation } from 'react-i18next'
import { FC } from 'react'
import AddedUsersTable from 'components/organisms/tables/AddedUsersTable/AddedUsersTable'
import classes from './classes.module.scss'
import { isEmpty } from 'lodash'
import classNames from 'classnames'
import { Root } from '@radix-ui/react-form'

const UsersManagement: FC = () => {
  const { users, handelFilterChange, handelSortingChange } = useFetchUsers()
  const { t } = useTranslation()

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
      {/* TODO: remove this form root wrapper, once we refactor CheckBox */}
      <Root>
        <AddedUsersTable
          data={users}
          hidden={isEmpty(users)}
          handelFilterChange={handelFilterChange}
          handelSortingChange={handelSortingChange}
        />
      </Root>
    </>
  )
}

export default UsersManagement
