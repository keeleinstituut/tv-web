import { FC, useCallback, useMemo } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { reduce, find, map, includes, startsWith } from 'lodash'
import { RoleType } from 'types/roles'
import { PrivilegeType } from 'types/privileges'
import {
  useUpdateRole,
  useDeleteRole,
  useCreateRole,
} from 'hooks/requests/roles'
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg'
import classes from './styles.module.scss'
import useAuth from 'hooks/useAuth'

interface PrivilegesFormValue {
  [key: string]: boolean
}

interface FormValues {
  privileges: PrivilegesFormValue
  name?: string
}

interface RoleFormProps extends RoleType {
  allPrivileges: PrivilegeType[]
  hidden?: boolean
  temporaryName?: string
  onReset: (id: string) => void
  onSubmitSuccess: (id: string, newId?: string) => void
}

// TODO: temporary, will swap with buttons from modal task later
interface FormButtonProps {
  loading: boolean
  disabled: boolean
  hidden?: boolean
  resetForm: () => void
}

const FormButtons: FC<FormButtonProps> = ({
  loading,
  disabled,
  hidden,
  resetForm,
}) => {
  const { t } = useTranslation()
  if (hidden) return null
  return (
    <div className={classes.formButtons}>
      <Button
        loading={loading}
        appearance={AppearanceTypes.Secondary}
        onClick={resetForm}
        children={t('button.cancel')}
        disabled={disabled}
      />
      <Button
        children={t('button.save_changes')}
        disabled={disabled || loading}
        type="submit"
      />
    </div>
  )
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
      const anyPrivilegePicked = find(data.privileges, (value) => value)
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
    ariaLabel: `label: ${key}`,
    label: `label: ${key}`,
    name: `privileges.${key}`,
  }))

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values, e) => {
      const { privileges: newPrivileges } = values
      const payload: RoleType = {
        name: temporaryName || name,
        privileges: reduce<PrivilegesFormValue, PrivilegeType[]>(
          newPrivileges,
          (result, value, key) => {
            if (!key || !value) {
              return result
            }
            return [
              ...result,
              {
                key,
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
        hidden={!includes(userPrivileges, 'DELETE_ROLE')}
      />
      <h2>{t('roles.privileges')}</h2>
      <DynamicForm
        fields={fields}
        control={control}
        onSubmit={handleSubmit(onSubmit)}
        className={classes.formContainer}
      >
        <FormButtons
          disabled={
            !isValid ||
            (!name && !temporaryName) ||
            (!isDirty && !hasNameChanged)
          }
          loading={isLoading || isCreating || isSubmitting}
          resetForm={resetForm}
          hidden={!includes(userPrivileges, 'EDIT_ROLE')}
        />
      </DynamicForm>
    </div>
  )
}

export default RoleForm
