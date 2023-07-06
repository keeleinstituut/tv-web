import Loader from 'components/atoms/Loader/Loader'
import UserForm from 'components/organisms/forms/UserForm/UserForm'
import {
  useArchiveUser,
  useDeactivateUser,
  useFetchUser,
} from 'hooks/requests/useUsers'
import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { includes, some } from 'lodash'
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

interface FormValues {
  user_deactivation_date?: string
  userId?: string
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
  const { deactivateUser, isLoading: isDeactivating } = useDeactivateUser()

  const currentDate = format(new Date(), 'dd.MM.yyyy')
  const splittedDateValue = currentDate?.split('.')

  const formattedDayValue =
    splittedDateValue?.[0] +
    '/' +
    splittedDateValue?.[1] +
    '/' +
    splittedDateValue?.[2]

  const user_deactivation_date = formattedDayValue

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: { user_deactivation_date },
    resetOptions: {
      keepErrors: true,
    },
  })

  const onSubmit = (values: any) => {
    deactivateUser({ ...values, userId })
  }

  const splittedDeactivationDate = user?.deactivation_date?.split('-')

  const formattedDeactivationDate =
    splittedDeactivationDate?.[2] +
    '.' +
    splittedDeactivationDate?.[1] +
    '.' +
    splittedDeactivationDate?.[0]

  const fields: FieldProps<FormValues>[] = [
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

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const userNameString = `${user.user.forename} ${user.user.surname}`
  const isMainUser = some(user?.roles, (mainUser) => mainUser?.is_root)
  const isUserDeactivated = !!user?.deactivation_date

  const splittedCurrentDate = currentDate?.split('.')

  const formattedCurrentDate =
    splittedCurrentDate?.[2] +
    '-' +
    splittedCurrentDate?.[1] +
    '-' +
    splittedCurrentDate?.[0]

  const isDeactivationDatePastCurrentDate =
    user?.deactivation_date === formattedCurrentDate

  const currentDate2 = new Date()
  const desiredDate = new Date(2023, 6, 1)

  console.log('currentDate2', currentDate2)
  console.log('desiredDate', desiredDate)

  if (desiredDate.getTime() < currentDate2.getTime()) {
    console.log('The desired date is in the past')
  } else {
    console.log('The desired date is in the future or the current date')
  }

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
      handleProceed: handleSubmit(onSubmit),
      deactivationForm: <DynamicForm fields={fields} control={control} />,
    })
  }

  const handleEditModalOpen = () => {
    !isMainUser &&
      showModal(ModalTypes.Remove, {
        title: t('modal.edit_deactivation_date'),
        cancelButtonContent: t('button.cancel'),
        proceedButtonContent: t('button.yes'),
        modalContent: t('modal.deactivate_user_content'),
        className: classes.deactivateContent,
        handleProceed: handleSubmit(onSubmit),
        deactivationForm: <DynamicForm fields={fields} control={control} />,
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
            //TODO handleActivateModal
            onClick={
              isUserDeactivated ? handleDeactivateModal : handleDeactivateModal
            }
            hidden={
              isUserDeactivated
                ? !includes(userPrivileges, Privileges.ActivateUser)
                : !includes(userPrivileges, Privileges.DeactivateUser)
            }
            disabled={!isDeactivationDatePastCurrentDate}
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
        <BaseButton loading={isDeactivating} onClick={handleEditModalOpen}>
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
