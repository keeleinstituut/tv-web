import Loader from 'components/atoms/Loader/Loader'
import UserForm from 'components/organisms/forms/UserForm/UserForm'
import {
  useArchiveUser,
  useDeactivateUser,
  useFetchUser,
} from 'hooks/requests/useUsers'
import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { compact, includes, map, some } from 'lodash'
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
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

import classes from './classes.module.scss'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { formatDate } from 'helpers'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

interface FormValues {
  user_deactivation_date?: string
  userId?: string
}

interface ActivateUserFormValues {
  options?: DropDownOptions[]
}

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
  const { deactivateUser, isLoading: isDeactivating } = useDeactivateUser()
  const deactivationDate = user?.deactivation_date || ''

  const currentDefaultDate = format(new Date(), 'dd.MM.yyyy')
  const defaultDateOrder = [0, 1, 2]
  const formattedDefaultDate = formatDate(
    currentDefaultDate || '',
    '.',
    '/',
    defaultDateOrder
  )

  const user_deactivation_date = formattedDefaultDate

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: { user_deactivation_date },
    resetOptions: {
      keepErrors: true,
    },
  })

  const deactivationDateOrder = [2, 1, 0]
  const formattedDeactivationDate = formatDate(
    deactivationDate,
    '-',
    '.',
    deactivationDateOrder
  )

  const deactivationFormFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Date,
      name: 'user_deactivation_date',
      ariaLabel: t('label.user_deactivation_date'),
      label: t('label.user_deactivation_date'),
      placeholder: 'pp.kk.aaaa',
      rules: {
        required: true,
      },
      className: classes.calenderPosition,
    },
  ]

  // const activationFormFields: FieldProps<FormValues>[] = [
  //   {
  //     inputType: InputTypes.Checkbox,
  //     name: 'user_activation_date',
  //     ariaLabel: t('label.user_deactivation_date'),
  //     label: t('label.user_deactivation_date'),
  //     placeholder: 'pp.kk.aaaa',
  //     rules: {
  //       required: true,
  //     },
  //     className: classes.calenderPosition,
  //   },
  // ]

  console.log('existingRoles', existingRoles)

  const roleOptions = compact(
    map(existingRoles, ({ name }) => {
      if (name) {
        return {
          label: name,
          value: name,
        }
      }
    })
  )

  console.log('roleOptions', roleOptions)

  const activationFormFields: FieldProps<ActivateUserFormValues>[] = map(
    roleOptions,
    ({ label }, index) => ({
      inputType: InputTypes.Selections,
      ariaLabel: label,
      label: label,
      // name: 'user_activation_date',
      name: `row-${index}.${label}`,
      // disabled: !includes(userPrivileges, Privileges.EditRole),
      // onClick: is_root ? handleMainUserPrivilegeClick : undefined,
    })
  )

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const userNameString = `${user.user.forename} ${user.user.surname}`
  const isMainUser = some(user?.roles, (mainUser) => mainUser?.is_root)
  const isUserDeactivated = !!deactivationDate

  const dateParts = deactivationDate?.split('-')
  const year = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1
  const day = parseInt(dateParts[2])

  const deactivatedDate = new Date(year, month, day)
  const currentDate = new Date()

  const isDeactivationDatePastCurrentDate =
    deactivatedDate.getTime() < currentDate.getTime()

  const handleArchiveModal = () => {
    !isMainUser &&
      showModal(ModalTypes.Remove, {
        title: t('modal.archive_user'),
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
  const handleDeactivateModal = () => {
    showModal(ModalTypes.Remove, {
      title: t('modal.deactivate_user'),
      cancelButtonContent: t('button.cancel'),
      proceedButtonContent: t('button.yes'),
      modalContent: t('modal.deactivate_user_content'),
      className: classes.deactivateContent,
      handleProceed: handleSubmit((values) =>
        deactivateUser({
          user_deactivation_date: values?.user_deactivation_date || '',
          userId: userId || '',
        })
      ),
      deactivationForm: (
        <DynamicForm fields={deactivationFormFields} control={control} />
      ),
    })
  }

  const handleEditModal = () => {
    !isMainUser &&
      showModal(ModalTypes.Remove, {
        title: t('modal.edit_deactivation_date'),
        cancelButtonContent: t('button.cancel'),
        proceedButtonContent: t('button.yes'),
        modalContent: t('modal.deactivate_user_content'),
        className: classes.deactivateContent,
        handleProceed: handleSubmit((values) =>
          deactivateUser({
            user_deactivation_date: values?.user_deactivation_date || '',
            userId: userId || '',
          })
        ),
        deactivationForm: (
          <DynamicForm fields={deactivationFormFields} control={control} />
        ),
      })
  }

  const handleActivateModal = () => {
    showModal(ModalTypes.Remove, {
      title: t('modal.activate_user'),
      cancelButtonContent: t('button.cancel'),
      proceedButtonContent: t('button.activate'),
      modalContent: t('modal.activate_user_content'),
      className: classes.deactivateContent,
      // handleProceed: handleSubmit((values) =>
      //   deactivateUser({
      //     user_deactivation_date: values?.user_deactivation_date || '',
      //     userId: userId || '',
      //   })
      // ),
      deactivationForm: (
        <DynamicForm fields={activationFormFields} control={control} />
      ),
    })
  }

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{userNameString}</h1>
        <div className={classes.buttonsContainer}>
          <Button
            loading={isUserDeactivated ? isDeactivating : isDeactivating}
            appearance={AppearanceTypes.Secondary}
            children={
              isUserDeactivated
                ? t('button.activate_account')
                : t('button.deactivate_account')
            }
            // onClick={
            //   isUserDeactivated ? handleDeactivateModal : handleActivateModal
            // }
            onClick={handleActivateModal}
            hidden={
              isUserDeactivated
                ? !includes(userPrivileges, Privileges.ActivateUser)
                : !includes(userPrivileges, Privileges.DeactivateUser)
            }
            // disabled={!isDeactivationDatePastCurrentDate && isUserDeactivated}
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

      <div hidden={!isUserDeactivated} className={classes.deactivationDate}>
        {t('label.future_user_deactivation_date', {
          deactivationDate: formattedDeactivationDate,
        })}
        <BaseButton loading={isDeactivating} onClick={handleEditModal}>
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
