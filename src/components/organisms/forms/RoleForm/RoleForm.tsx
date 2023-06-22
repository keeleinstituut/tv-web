import { FC, useCallback, useMemo } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import { reduce, find, map, includes, startsWith, join } from 'lodash'
import { RoleType } from 'types/roles'
import { PrivilegeType, PrivilegeKey, Privileges } from 'types/privileges'
import {
  useUpdateRole,
  useDeleteRole,
  useCreateRole,
} from 'hooks/requests/useRoles'
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg'
import classes from './styles.module.scss'
import useAuth from 'hooks/useAuth'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'

type PrivilegesFormValue = object & {
  [key in PrivilegeKey]?: boolean
}

interface FormValues {
  privileges: PrivilegesFormValue
}

interface RoleFormProps extends RoleType {
  allPrivileges: PrivilegeType[]
  hidden?: boolean
  temporaryName?: string
  onReset: (id: string) => void
  onSubmitSuccess: (id: string, newId?: string) => void
  isMainUser?: boolean
}

const RoleForm: FC<RoleFormProps> = ({
  id,
  privileges,
  allPrivileges,
  hidden,
  name,
  temporaryName,
  onReset,
  onSubmitSuccess,
  isMainUser,
}) => {
  console.log('id', id)
  console.log('isMainUser', isMainUser)

  const isTemporaryRole = startsWith(id, 'temp')
  const hasNameChanged = temporaryName && temporaryName !== name
  const defaultPrivileges = useMemo(
    () =>
      reduce(
        allPrivileges,
        (result, { key }) => {
          if (!key) {
            return result
          }
          const isPrivilegeSelected = !!find(privileges, { key })
          return {
            ...result,
            [key]: isPrivilegeSelected,
          }
        },
        {}
      ),
    [allPrivileges, privileges]
  )

  console.log('defaultPrivileges', defaultPrivileges)
  // hooks
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { updateRole, isLoading } = useUpdateRole({ roleId: id })
  const { createRole, isLoading: isCreating } = useCreateRole()
  const { deleteRole, isLoading: isDeleting } = useDeleteRole({ roleId: id })
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    values: {
      privileges: defaultPrivileges,
    },
    resetOptions: {
      keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
    },
    resolver: (data) => {
      // Validate entire form
      const anyPrivilegePicked = find(data.privileges, (value) => !!value)

      return {
        values: {
          privileges: data.privileges,
        },
        errors: {
          ...(!anyPrivilegePicked ? { privileges: '' } : {}),
        },
      }
    },
  })

  // map data for rendering
  const fields: FieldProps<FormValues>[] = map(allPrivileges, ({ key }) => ({
    inputType: InputTypes.Checkbox,
    ariaLabel: t(`privileges.${key}`),
    label: t(`privileges.${key}`),
    name: `privileges.${key}`,
    disabled: !includes(userPrivileges, Privileges.EditRole),
  }))

  console.log('userPrivileges', userPrivileges)

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values, e) => {
      const { privileges: newPrivileges } = values
      const newName = temporaryName || name
      const payload: RoleType = {
        name: newName,
        privileges: reduce<PrivilegesFormValue, PrivilegeType[]>(
          newPrivileges,
          (result, value, key) => {
            const typedKey = key as unknown as PrivilegeKey
            if (!typedKey || !value) {
              return result
            }
            return [
              ...result,
              {
                key: typedKey,
              },
            ]
          },
          []
        ),
      }

      try {
        if (isTemporaryRole) {
          const result = await createRole(payload)
          onSubmitSuccess(id || '', result.id)
        } else {
          await updateRole(payload)
        }
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: isTemporaryRole
            ? t('success.role_created', { roleName: newName })
            : t('success.role_updated', { roleName: newName }),
        })
      } catch (errorData) {
        // Set errors from BE for corresponding fields
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            console.log('errorsArray', errorsArray)

            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'custom', message: errorString })
          })
        }
      }
    },
    [
      temporaryName,
      name,
      isTemporaryRole,
      t,
      createRole,
      onSubmitSuccess,
      id,
      updateRole,
      setError,
    ]
  )

  const resetForm = useCallback(() => {
    reset(defaultPrivileges)
    onReset(id || '')
  }, [defaultPrivileges, id, onReset, reset])

  const isResetDisabled = !isDirty && !hasNameChanged
  const isSubmitDisabled =
    isResetDisabled || (!name && !temporaryName) || !isValid

  const showErrorMessage = () => {
    showNotification({
      type: NotificationTypes.Error,
      title: t('notification.announcement'),
      content: isMainUser
        ? 'It is not possible to delete the main user role'
        : '',
    })
  }

  if (hidden) return null

  return (
    <div className={classes.container}>
      <Button
        loading={isDeleting}
        appearance={AppearanceTypes.Text}
        children={t('button.delete_this_role')}
        icon={DeleteIcon}
        className={classes.deleteButton}
        // TODO: remove this disabled prop, once we have the ability to add roles
        // Also onClick should open the modal, not delete the role
        // onClick={deleteRole}
        // disabled
        onClick={showErrorMessage}
        hidden={!includes(userPrivileges, Privileges.DeleteRole)}
      />
      <h2>{t('roles.privileges')}</h2>
      <DynamicForm
        fields={fields}
        control={control}
        onSubmit={handleSubmit(onSubmit)}
        className={classes.formContainer}
      >
        <FormButtons
          isResetDisabled={isResetDisabled}
          isSubmitDisabled={isSubmitDisabled}
          loading={isLoading || isCreating || isSubmitting}
          resetForm={resetForm}
          hidden={!includes(userPrivileges, Privileges.EditRole)}
          className={classes.formButtons}
        />
      </DynamicForm>
    </div>
  )
}

export default RoleForm
