import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import AddUsersTableForm from 'components/organisms/forms/AddUsersTableForm/AddUsersTableForm'
import Tooltip from 'components/organisms/Tooltip/Tooltip'

const AddUsersPage: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('users.add_users')}</h1>
        <Tooltip helpSectionKey="addUsers" />
      </div>
      <AddUsersTableForm />
    </>
  )
}

export default AddUsersPage
