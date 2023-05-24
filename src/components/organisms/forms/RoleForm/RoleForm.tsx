import { FC, useCallback, useMemo } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import { reduce, find, map, includes, startsWith } from 'lodash'
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
}) => {
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

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values, e) => {
      const { privileges: newPrivileges } = values
      const payload: RoleType = {
        name: temporaryName || name,
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
      } catch (error) {
        // TODO: if needed, take fields with error from here
        // and mark them as invalid in hook form, using setError
        // TODO: Call global errorhandler here, once we implement it
        // errorHandler(error)
        alert(error)
      }
    },
    [
      temporaryName,
      name,
      isTemporaryRole,
      createRole,
      onSubmitSuccess,
      id,
      updateRole,
    ]
  )

  const resetForm = useCallback(() => {
    reset(defaultPrivileges)
    onReset(id || '')
  }, [defaultPrivileges, id, onReset, reset])

  const isResetDisabled = !isDirty && !hasNameChanged
  const isSubmitDisabled =
    isResetDisabled || (!name && !temporaryName) || !isValid

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
        onClick={deleteRole}
        disabled
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
