import { FC } from 'react'
import classes from './styles.module.scss'
import { useTranslation } from 'react-i18next'
import AddUsersTableForm from 'components/organisms/forms/AddUsersTableForm/AddUsersTableForm'

const AddUsersPage: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('users.add_users')}</h1>
      </div>
      <AddUsersTableForm />
    </>
  )
}

export default AddUsersPage
