import Loader from 'components/atoms/Loader/Loader'
import UserForm from 'components/organisms/forms/UserForm/UserForm'
import {
  useActivateUser,
  useArchiveUser,
  useDeactivateUser,
  useFetchUser,
} from 'hooks/requests/useUsers'
import { FC, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { includes, map } from 'lodash'
import dayjs from 'dayjs'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import {
  ModalTypes,
  closeModal,
  showModal,
} from 'components/organisms/modals/ModalRoot'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useRolesFetch } from 'hooks/requests/useRoles'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { UserStatus, UserStatusType } from 'types/users'

import classes from './classes.module.scss'

interface FormValues {
  deactivation_date?: string
  roles?: string[]
  notify_user?: boolean
}

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)

const UserPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId } = useParams()

  const { userPrivileges } = useAuth()

  const { isLoading, isError, user } = useFetchUser({
    id: userId,
  })
  const { existingRoles = [] } = useRolesFetch({})
  const { archiveUser, isLoading: isArchiving } = useArchiveUser({
    institution_user_id: userId,
  })
  const { activateUser, isLoading: isActivating } = useActivateUser({
    institution_user_id: userId,
  })
  const { deactivateUser, isLoading: isDeactivating } = useDeactivateUser({
    institution_user_id: userId,
  })
  const deactivationDate = user?.deactivation_date || ''
  const name = `${user?.user.forename} ${user?.user.surname}`
  const status = user?.status

  const isUserArchived = user?.archived_at !== null

  const editModalTitle = t('modal.edit_deactivation_date')
  const deactivateModalTitle = t('modal.deactivate_user_account')

  const today = dayjs().format('DD/MM/YYYY')

  const defaultValues = useMemo(
    () => ({
      deactivation_date: deactivationDate
        ? dayjs(deactivationDate).format('DD/MM/YYYY')
        : today,
    }),
    [deactivationDate, today]
  )

  const { control, handleSubmit, reset } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues,
  })

  const formattedDeactivationDate = dayjs(
    deactivationDate,
    'YYYY-MM-DD'
  ).format('DD.MM.YYYY')

  const yearFromCurrentDate = dayjs().add(1, 'year').toDate()
  const formattedDate = dayjs(yearFromCurrentDate).format('MM/DD/YYYY')

  const deactivationFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Date,
      name: 'deactivation_date',
      ariaLabel: t('label.user_deactivation_date'),
      label: `${t('label.user_deactivation_date')}*`,
      placeholder: 'pp.kk.aaaa',
      rules: {
        required: true,
      },
      className: classes.calenderPosition,
      minDate: new Date(),
      maxDate: new Date(formattedDate),
    },
  ]

  const roleOptions = map(existingRoles, ({ name, id }) => {
    return {
      label: name || '',
      value: id || '',
    }
  })

  const activationFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'roles',
      ariaLabel: t('placeholder.roles'),
      placeholder: t('placeholder.roles'),
      options: roleOptions,
      multiple: true,
      buttons: true,
      rules: {
        required: true,
      },
      usePortal: true,
    },
    {
      inputType: InputTypes.Checkbox,
      name: 'notify_user',
      label: t('label.user_activation_notification'),
      ariaLabel: t('label.user_activation_notification'),
      className: classes.checkboxInputClass,
    },
  ]

  const onArchive = useCallback(async () => {
    try {
      await archiveUser()
      closeModal()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.user_archived', { name }),
      })
      navigate('/settings/users')
    } catch (_) {}
  }, [navigate, archiveUser, t, name])

  const onDeactivateSubmit: SubmitHandler<FormValues> = useCallback(
    async ({ roles, ...rest }) => {
      const isUserEditingDeactivationDate = deactivationDate !== ''

      try {
        await deactivateUser({ ...rest })
        closeModal()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: isUserEditingDeactivationDate
            ? t('success.deactivation_date_edit', { name })
            : t('success.user_deactivated', { name }),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [deactivationDate, deactivateUser, t, name]
  )

  const handleCancelDeactivation = useCallback(async () => {
    try {
      await deactivateUser({ deactivation_date: null })
      closeModal()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.deactivation_cancelled', { name }),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [deactivateUser, name, t])

  const onActivateSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const { notify_user, roles } = values

      const payload: UserStatusType = {
        roles,
        notify_user: !!notify_user,
      }
      try {
        await activateUser(payload)
        closeModal()
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.user_activated', { name }),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [activateUser, t, name]
  )

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const isUserDeactivated = !!deactivationDate

  const isDeactivationDateInTheFuture = dayjs().isBefore(
    dayjs(deactivationDate),
    'day'
  )

  const handleArchiveModal = () => {
    showModal(ModalTypes.UserAndRoleManagement, {
      title: t('modal.archive_user_account'),
      modalContent: t('modal.archive_user_content'),
      className: classes.archiveContent,
      handleProceed: onArchive,
    })
  }

  const handleDeactivateModal = (isEditModal: boolean) => {
    reset(defaultValues)
    showModal(ModalTypes.UserAndRoleManagement, {
      title: isEditModal ? editModalTitle : deactivateModalTitle,
      cancelButtonContent: t('button.cancel'),
      modalContent: t('modal.deactivate_user_content'),
      handleProceed: handleSubmit(onDeactivateSubmit),
      className: classes.deactivateContent,
      dynamicForm: (
        <DynamicForm
          fields={deactivationFormFields}
          control={control}
          className={classes.deactivateDynamicForm}
        />
      ),
    })
  }

  const handleActivateModal = () => {
    reset(defaultValues)
    showModal(ModalTypes.UserAndRoleManagement, {
      title: t('modal.activate_user_account'),
      cancelButtonContent: t('button.cancel'),
      proceedButtonContent: t('button.activate'),
      modalContent: t('modal.activate_user_content'),
      className: classes.activateContent,
      handleProceed: handleSubmit(onActivateSubmit),
      dynamicForm: (
        <DynamicForm
          fields={activationFormFields}
          control={control}
          className={classes.activateDynamicForm}
        />
      ),
    })
  }

  const handleOnRemoveDeactivationDate = () => {
    showModal(ModalTypes.UserAndRoleManagement, {
      title: t('modal.remove_deactivation_date'),
      modalContent: t('modal.deactivation_date_content', {
        date: formattedDeactivationDate,
      }),
      className: classes.archiveContent,
      handleProceed: handleCancelDeactivation,
    })
  }

  const deactivatedText = isDeactivationDateInTheFuture
    ? t('label.future_user_deactivation_date', {
        deactivationDate: formattedDeactivationDate,
      })
    : t('label.past_user_deactivation_date', {
        deactivationDate: formattedDeactivationDate,
      })

  const isActivationButtonHidden =
    status === UserStatus.Archived ||
    (!includes(userPrivileges, Privileges.ActivateUser) && isUserDeactivated) ||
    (!includes(userPrivileges, Privileges.DeactivateUser) && !isUserDeactivated)

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{name}</h1>
        <div className={classes.buttonsContainer}>
          <Button
            loading={isUserDeactivated ? isActivating : isDeactivating}
            appearance={AppearanceTypes.Secondary}
            children={
              isUserDeactivated
                ? t('button.activate_account')
                : t('button.deactivate_account')
            }
            onClick={
              isUserDeactivated
                ? handleActivateModal
                : () => handleDeactivateModal(false)
            }
            hidden={isActivationButtonHidden}
            disabled={isDeactivationDateInTheFuture && isUserDeactivated}
          />
          <Button
            loading={isArchiving}
            children={t('button.archive_account')}
            onClick={handleArchiveModal}
            hidden={!includes(userPrivileges, Privileges.ArchiveUser)}
            disabled={isUserArchived}
          />
        </div>
      </div>

      <div
        className={classNames(
          classes.deactivationDate,
          !isUserDeactivated && classes.hidden
        )}
      >
        <span>{deactivatedText}</span>
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Edit}
          className={classes.editIcon}
          onClick={() => handleDeactivateModal(true)}
          hidden={
            !isDeactivationDateInTheFuture ||
            status === UserStatus.Archived ||
            !includes(userPrivileges, Privileges.DeactivateUser)
          }
        />
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Delete}
          className={classes.button}
          onClick={handleOnRemoveDeactivationDate}
          hidden={
            !isDeactivationDateInTheFuture ||
            status === UserStatus.Archived ||
            !includes(userPrivileges, Privileges.DeactivateUser)
          }
        />
      </div>

      <UserForm {...user} />
      <p className={classes.dateText}>
        {t('user.created_at', {
          time: dayjs(user.created_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
      <p className={classes.dateText}>
        {t('user.updated_at', {
          time: dayjs(user.updated_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
    </>
  )
}

export default UserPage
