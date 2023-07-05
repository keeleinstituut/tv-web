import Loader from 'components/atoms/Loader/Loader'
import UserForm from 'components/organisms/forms/UserForm/UserForm'
import { useArchiveUser, useFetchUser } from 'hooks/requests/useUsers'
import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { includes, some } from 'lodash'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'

import classes from './classes.module.scss'

const UserPage: FC = () => {
  const { t } = useTranslation()
  const { userId } = useParams()
  const { userPrivileges } = useAuth()
  const { isLoading, isError, user } = useFetchUser({
    userId,
  })
  const { archiveUser, isLoading: isArchiving } = useArchiveUser({
    userId: userId,
  })
  const navigate = useNavigate()

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const userNameString = `${user.user.forename} ${user.user.surname}`

  const handleArchiveModal = () => {
    const isMainUser = some(user?.roles, (mainUser) => mainUser?.is_root)

    !isMainUser &&
      showModal(ModalTypes.DeleteRole, {
        title: t('modal.archive_user_account'),
        cancelButtonContent: t('button.no'),
        proceedButtonContent: t('button.yes'),
        modalContent: t('modal.archive_user_content'),
        className: classes.archiveContent,
        handleProceed: () => {
          archiveUser()
          navigate('/settings/users')
        },
      })
  }

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{userNameString}</h1>
        <div className={classes.buttonsContainer}>
          <Button
            appearance={AppearanceTypes.Secondary}
            children={t('button.deactivate_account')}
            // TODO: disabled for now, we don't have endpoint for this
            // open confirmation modal from here
            disabled
            hidden={!includes(userPrivileges, Privileges.DeactivateUser)}
          />
          <Button
            loading={isArchiving}
            appearance={AppearanceTypes.Secondary}
            children={t('button.archive_account')}
            onClick={handleArchiveModal}
            hidden={!includes(userPrivileges, Privileges.ArchiveUser)}
          />
        </div>
      </div>
      <UserForm {...user} />
      <p className={classes.dateText}>
        {t('user.created_at', {
          time: dayjs(user.created_at).format('DD.MM.YYYY hh:mm') || '',
        })}
      </p>
      <p className={classes.dateText}>
        {t('user.updated_at', {
          time: dayjs(user.updated_at).format('DD.MM.YYYY hh:mm') || '',
        })}
      </p>
    </>
  )
}

export default UserPage
