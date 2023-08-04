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
import { useUpdateUser } from 'hooks/requests/useUsers'
import { useFetchTags } from 'hooks/requests/useTags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { Vendor } from 'types/vendors'

interface FormValues {
  name?: string
  email?: string
  phone?: string
  company_name?: string
  comment?: string
  tags?: string
}

type VendorFormProps = {
  vendor: Vendor
}

const VendorPage: FC<VendorFormProps> = ({ vendor }) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { tags = [] } = useFetchTags()

  const { updateUser } = useUpdateUser({ userId: vendor.id }) // TODO: remove

  console.log('vendors', vendor)

  const { institution_user, company_name, comment, tags: vendorTags } = vendor

  const {
    user: { forename, surname },
    email,
    phone,
  } = institution_user

  const defaultValues = useMemo(
    () => ({
      name: `${forename} ${surname}`,
      email,
      phone,
      comment,
      company_name,
    }),
    [company_name, email, forename, phone, surname, comment]
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

  const tagOptions = map(tags, ({ name, id }) => {
    return {
      label: name || '',
      value: id || '',
    }
  })

  const isFormDisabled = !includes(userPrivileges, Privileges.EditUser)

  // map data for rendering
  const fields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.name'),
      placeholder: t('placeholder.name'),
      label: `${t('label.name')}*`,
      disabled: true,
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
      disabled: true,
      label: `${t('label.email')}*`,
      name: 'email',
      type: 'email',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    // TODO: add masking for phone number input, once we merge timeinput
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.phone'),
      placeholder: t('placeholder.phone'),
      disabled: true,
      label: `${t('label.phone')}*`,
      name: 'phone',
      type: 'tel',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.company_name'),
      placeholder: t('placeholder.write_here'),
      disabled: isFormDisabled,
      label: `${t('label.company_name')}*`,
      name: 'company_name',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.tags'),
      placeholder: t('placeholder.select_tags'),
      label: `${t('label.tags')}*`,
      name: 'tags',
      className: classes.inputInternalPosition,
      options: tagOptions,
      multiple: true,
      buttons: true,
      disabled: isFormDisabled,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Text,
      isTextarea: true,
      ariaLabel: t('label.comment'),
      placeholder: t('placeholder.write_here'),
      disabled: isFormDisabled,
      label: `${t('label.comment')}*`,
      name: 'comment',
      type: 'comment',
      className: classes.inputInternalPosition,
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
      const { name, ...rest } = values

      const splitName = split(name, ' ')
      const surname = size(splitName) > 1 ? last(splitName) : ''
      const forename =
        size(splitName) > 1 ? join(initial(splitName), ' ') : name

      const payload = {
        ...rest,
        // ...(isEmpty(roles) ? {} : { roles }),
        user: {
          surname,
          forename,
        },
      }
      try {
        // TODO: implement
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.vendor_updated', { name }),
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
        loading={isSubmitting}
        resetForm={resetForm}
        hidden={isFormDisabled}
        className={classes.formButtons}
      />
    </DynamicForm>
  )
}

export default VendorPage
