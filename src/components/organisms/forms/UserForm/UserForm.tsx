import { FC, useCallback } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import { includes, split, size, last, join, initial, isEmpty } from 'lodash'
import { Privileges } from 'types/privileges'
import classes from './styles.module.scss'
import useAuth from 'hooks/useAuth'
import { UserType, UserPostType } from 'types/users'
import { useUpdateUser } from 'hooks/requests/useUsers'
import useValidators from 'hooks/useValidators'

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
  // roles,
}) => {
  // hooks
  const { personal_identification_code, forename, surname } = user
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { emailValidator, phoneValidator } = useValidators()
  const { updateUser, isLoading } = useUpdateUser({ userId: id })

  const defaultValues = {
    personal_identification_code,
    name: `${forename} ${surname}`,
    email,
    phone,
    department_id: department,
    roles: [],
  }
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: defaultValues,
    resetOptions: {
      keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
    },
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
      inputType: InputTypes.Text,
      disabled: true,
      ariaLabel: t('label.roles'),
      placeholder: t('placeholder.roles'),
      label: `${t('label.roles')}*`,
      name: 'roles',
      className: classes.inputInternalPosition,
    },
  ]

  const resetForm = useCallback(() => {
    reset()
  }, [reset])

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
      const forename = join(initial(splitName), ' ')
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
        resetForm()
      } catch (error) {
        // TODO: if needed, take fields with error from here
        // and mark them as invalid in hook form, using setError
        // TODO: Call global errorhandler here, once we implement it
        // errorHandler(error)
        alert(error)
      }
    },
    [updateUser, resetForm]
  )

  const isResetDisabled = !isDirty
  const isSubmitDisabled = isResetDisabled || !isValid

  return (
    <DynamicForm
      fields={fields}
      control={control}
      onSubmit={handleSubmit(onSubmit)}
      className={classes.formContainer}
    >
      <FormButtons
        isResetDisabled={isResetDisabled}
        isSubmitDisabled={isSubmitDisabled}
        loading={isSubmitting || isLoading}
        resetForm={resetForm}
        hidden={!includes(userPrivileges, Privileges.EditUser)}
        className={classes.formButtons}
      />
    </DynamicForm>
  )
}

export default UserForm
