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
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

interface FormValues {
  user_deactivation_date?: string
}

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
  const currentDate = format(new Date(), 'dd.MM.yyyy')
  const splittedDayValue = currentDate?.split('.')

  const formattedDayValue =
    splittedDayValue?.[0] +
    '/' +
    splittedDayValue?.[1] +
    '/' +
    splittedDayValue?.[2]

  const user_deactivation_date = formattedDayValue

  const {
    control,
    getValues,
    // handleSubmit,
    // setError,
    // formState: { isValid, isDirty },
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: { user_deactivation_date },
    resetOptions: {
      keepErrors: true,
    },
  })

  const values = getValues()?.user_deactivation_date

  const splittedDeactivationDate = values?.split('/')

  const formattedDeactivationDate =
    splittedDeactivationDate?.[0] +
    '.' +
    splittedDeactivationDate?.[1] +
    '.' +
    splittedDeactivationDate?.[2]

  console.log('values', values)

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

  const deactivationDate = formattedDeactivationDate

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const userNameString = `${user.user.forename} ${user.user.surname}`
  const isMainUser = some(user?.roles, (mainUser) => mainUser?.is_root)

  const handleArchiveModal = () => {
    !isMainUser &&
      showModal(ModalTypes.DeleteRole, {
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
    !isMainUser &&
      showModal(ModalTypes.DeactivateUser, {
        title: t('modal.deactivate_user'),
        cancelButtonContent: t('button.cancel'),
        proceedButtonContent: t('button.yes'),
        modalContent: t('modal.deactivate_user_content'),
        className: classes.archiveContent,
        handleProceed: () => {
          navigate('/settings/users')
        },
        deactivationForm: <DynamicForm fields={fields} control={control} />,
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
            onClick={handleDeactivateModal}
            hidden={!includes(userPrivileges, Privileges.DeactivateUser)}
          />
          <Button
            loading={isArchiving}
            appearance={AppearanceTypes.Secondary}
            children={t('button.archive_account')}
            disabled
            onClick={handleArchiveModal}
            hidden={!includes(userPrivileges, Privileges.ArchiveUser)}
          />
        </div>
      </div>
      <div className={classes.deactivationDate}>
        {t('label.future_user_deactivation_date', {
          deactivationDate: deactivationDate,
        })}
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
