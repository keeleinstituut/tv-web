import { FC, useCallback, useEffect, useMemo } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import {
  includes,
  split,
  size,
  last,
  join,
  initial,
  isEmpty,
  map,
  startsWith,
} from 'lodash'
import { Privileges } from 'types/privileges'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import { UserType, UserPostType, UserStatus } from 'types/users'
import { useUpdateUser } from 'hooks/requests/useUsers'
import useValidators from 'hooks/useValidators'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { useRolesFetch } from 'hooks/requests/useRoles'
import { useDepartmentsFetch } from 'hooks/requests/useDepartments'

interface FormValues {
  personal_identification_code?: string
  name?: string
  email?: string
  phone?: string
  department_id?: string
  roles?: string[]
}

type UserFormProps = { isUserAccount?: boolean } & Partial<UserType>

const UserForm: FC<UserFormProps> = ({
  id,
  user,
  email,
  phone,
  department,
  roles,
  status,
  isUserAccount = false,
}) => {
  // hooks
  // TODO: department still needs to be handled
  const { personal_identification_code, forename, surname } = user || {}
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { emailValidator, phoneValidator } = useValidators()
  const { updateUser, isLoading } = useUpdateUser({ id })
  const { existingRoles = [] } = useRolesFetch()
  const { existingDepartments = [] } = useDepartmentsFetch()

  const defaultValues = useMemo(
    () => ({
      personal_identification_code,
      name: `${forename} ${surname}`,
      email,
      phone,
      department_id: department ? department?.id : undefined,
      roles: map(roles, 'id'),
    }),
    [
      department,
      email,
      forename,
      personal_identification_code,
      phone,
      roles,
      surname,
    ]
  )
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isValid },
    setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: defaultValues,
  })

  const roleOptions = map(existingRoles, ({ name, id }) => {
    return {
      label: name || '',
      value: id || '',
    }
  })

  const departmentOptions = map(existingDepartments, ({ name, id }) => {
    return {
      label: name || '',
      value: id || '',
    }
  })

  const isFormDisabled =
    !includes(userPrivileges, Privileges.EditUser) ||
    status === UserStatus.Archived

  // map data for rendering
  const fields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      disabled: true,
      ariaLabel: t('label.personal_identification_code'),
      placeholder: t('placeholder.personal_identification_code'),
      label: `${t('label.personal_identification_code')}*`,
      name: 'personal_identification_code',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.name'),
      placeholder: t('placeholder.name'),
      label: `${t('label.name')}*`,
      disabled: isFormDisabled,
      name: 'name',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.email'),
      placeholder: t('placeholder.email'),
      disabled: isFormDisabled,
      label: `${t('label.email')}*`,
      name: 'email',
      type: 'email',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
        validate: emailValidator,
      },
    },
    // TODO: add masking for phone number input, once we merge timeinput
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.phone_alt'),
      placeholder: t('placeholder.phone'),
      disabled: isFormDisabled,
      label: `${t('label.phone_alt')}*`,
      name: 'phone',
      type: 'tel',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
        validate: phoneValidator,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.department'),
      placeholder: t('placeholder.department'),
      label: t('label.department'),
      name: 'department_id',
      className: classes.inputInternalPosition,
      options: departmentOptions,
      disabled: isFormDisabled,
      hidden: isUserAccount,
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.roles'),
      placeholder: t('placeholder.roles'),
      label: `${t('label.roles')}*`,
      name: 'roles',
      className: classes.inputInternalPosition,
      options: roleOptions,
      multiple: true,
      buttons: true,
      disabled: isFormDisabled || status === UserStatus.Deactivated,
      rules: {
        required: true,
      },
      hidden: isUserAccount,
    },
  ]

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    resetForm()
  }, [defaultValues, resetForm])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const {
        personal_identification_code,
        name,
        roles,
        department_id,
        ...rest
      } = values

      const splitName = split(name, ' ')
      const surname = size(splitName) > 1 ? last(splitName) : ''
      const forename =
        size(splitName) > 1 ? join(initial(splitName), ' ') : name

      const payload: UserPostType = {
        ...rest,
        ...(isEmpty(roles) ? {} : { roles }),
        ...(!department_id ? {} : { department_id }),
        user: {
          surname,
          forename,
        },
      }
      try {
        await updateUser(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.user_updated', { name }),
        })
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            if (startsWith(typedKey, 'user')) {
              setError('name', { type: 'backend', message: errorString })
            } else {
              setError(typedKey, { type: 'backend', message: errorString })
            }
          })
        }
      }
    },
    [updateUser, t, setError]
  )

  return (
    <DynamicForm
      fields={fields}
      control={control}
      onSubmit={handleSubmit(onSubmit)}
      className={classes.formContainer}
    >
      <FormButtons
        isResetDisabled={!isDirty}
        isSubmitDisabled={!isDirty || !isValid}
        loading={isSubmitting || isLoading}
        resetForm={resetForm}
        hidden={isFormDisabled}
        className={classes.formButtons}
      />
    </DynamicForm>
  )
}

export default UserForm
