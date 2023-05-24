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
import { PrivilegeType, PrivilegeKey } from 'types/privileges'
import {
  useUpdateRole,
  useDeleteRole,
  useCreateRole,
} from 'hooks/requests/useRoles'
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg'
import classes from './styles.module.scss'
import useAuth from 'hooks/useAuth'
import { UserType } from 'types/users'

// type PrivilegesFormValue = object & {
//   [key in PrivilegeKey]?: boolean
// }

// interface FormValues {}

type UserFormProps = UserType

// TODO: temporary, will swap with buttons from modal task later
interface FormButtonProps {
  loading: boolean
  isResetDisabled: boolean
  isSubmitDisabled: boolean
  hidden?: boolean
  resetForm: () => void
}

const FormButtons: FC<FormButtonProps> = ({
  loading,
  isResetDisabled,
  isSubmitDisabled,
  hidden,
  resetForm,
}) => {
  const { t } = useTranslation()
  if (hidden) return null
  return (
    <div className={classes.formButtons}>
      <Button
        appearance={AppearanceTypes.Secondary}
        onClick={resetForm}
        children={t('button.cancel')}
        disabled={isResetDisabled || loading}
      />
      <Button
        children={t('button.save_changes')}
        disabled={isSubmitDisabled}
        loading={loading}
        type="submit"
      />
    </div>
  )
}

const UserForm: FC<UserFormProps> = ({
  id,
  user,
  email,
  phone,
  department,
  roles,
}) => {
  // hooks
  const { personal_identification_code, forename, surname } = user
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  // const { updateRole, isLoading } = useUpdateUser({ userId: id })
  // const {
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { isSubmitting, isDirty, isValid },
  // } = useForm<FormValues>({
  //   reValidateMode: 'onSubmit',
  //   defaultValues: {},
  //   resetOptions: {
  //     keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
  //   },
  // })

  // map data for rendering
  // const fields: FieldProps<FormValues>[] = map(allPrivileges, ({ key }) => ({
  //   inputType: InputTypes.Checkbox,
  //   ariaLabel: t(`privileges.${key}`),
  //   label: t(`privileges.${key}`),
  //   name: `privileges.${key}`,
  // }))

  // const onSubmit: SubmitHandler<FormValues> = useCallback(async (values, e) => {
  //   try {
  //   } catch (error) {
  //     // TODO: if needed, take fields with error from here
  //     // and mark them as invalid in hook form, using setError
  //     // TODO: Call global errorhandler here, once we implement it
  //     // errorHandler(error)
  //     alert(error)
  //   }
  // }, [])

  // const resetForm = useCallback(() => {
  //   reset()
  // }, [reset])

  // const isResetDisabled = !isDirty
  // const isSubmitDisabled = isResetDisabled || !isValid

  // if (hidden) return null

  return (
    <div />
    // <DynamicForm
    //   fields={fields}
    //   control={control}
    //   onSubmit={handleSubmit(onSubmit)}
    //   className={classes.formContainer}
    // >
    //   <FormButtons
    //     isResetDisabled={isResetDisabled}
    //     isSubmitDisabled={isSubmitDisabled}
    //     loading={isSubmitting}
    //     resetForm={resetForm}
    //     hidden={!includes(userPrivileges, 'EDIT_USER')}
    //   />
    // </DynamicForm>
  )
}

export default UserForm
