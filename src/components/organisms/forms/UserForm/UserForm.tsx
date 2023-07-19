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
import { UserType, UserPostType } from 'types/users'
import { useUpdateUser } from 'hooks/requests/useUsers'
import useValidators from 'hooks/useValidators'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { useRolesFetch } from 'hooks/requests/useRoles'

interface FormValues {
  personal_identification_code?: string
  name?: string
  email?: string
  phone?: string
  department_id?: string
  roles?: string[]
}

type UserFormProps = UserType

const UserForm: FC<UserFormProps> = ({
  id,
  user,
  email,
  phone,
  department,
}) => {
  // hooks
  const { personal_identification_code, forename, surname } = user
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { emailValidator, phoneValidator } = useValidators()
  const { updateUser, isLoading } = useUpdateUser({ userId: id })
  const { existingRoles = [] } = useRolesFetch()

  const defaultValues = useMemo(
    () => ({
      personal_identification_code,
      name: `${forename} ${surname}`,
      email,
      phone,
      department_id: department,
      roles: [],
    }),
    [department, email, forename, personal_identification_code, phone, surname]
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
      disabled: !includes(userPrivileges, Privileges.EditUser),
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
      disabled: !includes(userPrivileges, Privileges.EditUser),
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
      ariaLabel: t('label.phone'),
      placeholder: t('placeholder.phone'),
      disabled: !includes(userPrivileges, Privileges.EditUser),
      label: `${t('label.phone')}*`,
      name: 'phone',
      type: 'tel',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
        validate: phoneValidator,
      },
    },
    {
      inputType: InputTypes.Text,
      disabled: true,
      ariaLabel: t('label.department'),
      placeholder: t('placeholder.department'),
      label: t('label.department'),
      name: 'department_id',
      className: classes.inputInternalPosition,
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
      rules: {
        required: true,
      },
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

      console.log('roles', roles)

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
        hidden={!includes(userPrivileges, Privileges.EditUser)}
        className={classes.formButtons}
      />
    </DynamicForm>
  )
}

export default UserForm
