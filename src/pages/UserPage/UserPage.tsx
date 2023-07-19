import Loader from 'components/atoms/Loader/Loader'
import UserForm from 'components/organisms/forms/UserForm/UserForm'
import {
  useActivateUser,
  useArchiveUser,
  useDeactivateUser,
  useFetchUser,
} from 'hooks/requests/useUsers'
import { FC, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { includes, join, map } from 'lodash'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { Privileges } from 'types/privileges'
import useAuth from 'hooks/useAuth'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { useRolesFetch } from 'hooks/requests/useRoles'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { UserStatusType } from 'types/users'

import classes from './classes.module.scss'

interface FormValues {
  deactivation_date?: string
  institution_user_id?: string
  roles?: (string | undefined)[]
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
    userId,
  })
  const { archiveUser, isLoading: isArchiving } = useArchiveUser({
    userId: userId,
  })
  const { existingRoles = [] } = useRolesFetch()
  const { activateUser, isLoading: isActivating } = useActivateUser({
    institution_user_id: userId,
  })
  const { deactivateUser, isLoading: isDeactivating } = useDeactivateUser({
    institution_user_id: userId,
  })
  const deactivationDate = user?.deactivation_date || ''
  const forename = user?.user?.forename || ''
  const surname = user?.user?.surname || ''
  const name = `${forename} ${surname}`

  const editModalTitle = t('modal.edit_deactivation_date')
  const deactivateModalTitle = t('modal.deactivate_user_account')

  const institution_user_id = userId

  const deactivation_date = dayjs(new Date()).format('DD/MM/YYYY')

  const { control, handleSubmit, setError } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: { deactivation_date },
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
      label: t('label.user_deactivation_date'),
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
      tags: true,
      rules: {
        required: true,
      },
      className: classes.selectionsInputClass,
    },
    {
      inputType: InputTypes.Checkbox,
      name: 'notify_user',
      label: t('label.user_activation_notification'),
      ariaLabel: t('label.user_activation_notification'),
      rules: {
        required: true,
      },
      className: classes.checkboxInputClass,
    },
  ]

  const onDeactivateSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const isUserEditingDeactivationDate = deactivationDate !== ''

      const payload: UserStatusType = { ...values, institution_user_id }

      try {
        await deactivateUser(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: isUserEditingDeactivationDate
            ? t('success.deactivation_date_edit', { name })
            : t('success.user_deactivated', { name }),
        })
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [deactivationDate, institution_user_id, deactivateUser, t, name, setError]
  )

  const onActivateSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const payload: UserStatusType = { ...values, institution_user_id }

      try {
        await activateUser(payload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.user_activated', { name }),
        })
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [institution_user_id, activateUser, t, name, setError]
  )

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const userNameString = `${user.user.forename} ${user.user.surname}`
  const isUserDeactivated = !!deactivationDate

  const isDeactivationDatePastCurrentDate = dayjs().isAfter(
    dayjs(deactivationDate)
  )

  const handleArchiveModal = () => {
    showModal(ModalTypes.UserAndRoleManagement, {
      title: t('modal.archive_user_account'),
      modalContent: t('modal.archive_user_content'),
      className: classes.archiveContent,
      handleProceed: () => {
        archiveUser()
        navigate('/settings/users')
      },
    })
  }

  const handleDeactivateModal = (title: string) => {
    showModal(ModalTypes.UserAndRoleManagement, {
      title: title,
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

  const currentFormattedDate = dayjs().format('YYYY-MM-DD')
  const isUserDeactivatedImmediately = deactivationDate === currentFormattedDate

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{userNameString}</h1>
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
                : () => handleDeactivateModal(deactivateModalTitle)
            }
            hidden={
              isUserDeactivated
                ? !includes(userPrivileges, Privileges.ActivateUser)
                : !includes(userPrivileges, Privileges.DeactivateUser)
            }
            disabled={!isDeactivationDatePastCurrentDate && isUserDeactivated}
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

      <div
        hidden={!isUserDeactivated || isUserDeactivatedImmediately}
        className={classes.deactivationDate}
      >
        {t('label.future_user_deactivation_date', {
          deactivationDate: formattedDeactivationDate,
        })}
        <BaseButton
          loading={isDeactivating}
          onClick={() => handleDeactivateModal(editModalTitle)}
        >
          <Edit className={classes.editIcon} />
        </BaseButton>
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
