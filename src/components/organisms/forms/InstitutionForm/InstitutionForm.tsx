import { FC, ReactElement, useCallback, useMemo, useState } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import { includes, join, map } from 'lodash'
import { Privileges } from 'types/privileges'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import useValidators from 'hooks/useValidators'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { useInstitutionUpdate } from 'hooks/requests/useInstitutions'
import { InstitutionPostType, InstitutionType } from 'types/institutions'
import Button from 'components/molecules/Button/Button'
import classNames from 'classnames'

interface FormValues {
  name: string
  short_name?: string | null
  email?: string | null
  phone?: string | null
}

type InstitutionPropTypes = {
  workingTimes?: ReactElement
  vacationDays?: ReactElement
} & InstitutionType

const InstitutionForm: FC<InstitutionPropTypes> = ({
  id,
  name,
  short_name,
  email,
  phone,
  workingTimes,
  vacationDays,
}) => {
  // hooks
  const { t } = useTranslation()
  const [isUpdatingData, setIsUpdatingData] = useState(false)
  const { userPrivileges } = useAuth()
  const { emailValidator, phoneValidator, nameInputValidator } = useValidators()
  const { updateInstitution, isLoading } = useInstitutionUpdate({
    id,
  })

  const defaultValues = useMemo(
    () => ({
      name,
      short_name,
      email,
      phone,
    }),
    [email, name, phone, short_name]
  )
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
    setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    mode: 'onTouched',
    values: defaultValues,
  })

  const fields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.institution'),
      label: `${t('label.institution')}*`,
      disabled: !isUpdatingData,
      name: 'name',
      className: classNames(classes.inputInternalPosition, {
        [classes.updateInput]: isUpdatingData,
      }),
      hasInputValueSize: true,
      rules: {
        required: true,
        validate: nameInputValidator,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.institution_short'),
      label: `${t('label.institution_short')}*`,
      disabled: !isUpdatingData,
      name: 'short_name',
      className: classNames(classes.inputInternalPosition, {
        [classes.updateInput]: isUpdatingData,
      }),
      rules: {
        required: true,
        validate: nameInputValidator,
      },
    },
    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.email_long'),
      disabled: !isUpdatingData,
      label: t('label.email_long'),
      name: 'email',
      type: 'email',
      className: classNames(classes.inputInternalPosition, {
        [classes.updateInput]: isUpdatingData,
      }),
      rules: {
        required: false,
        validate: emailValidator,
      },
    },

    {
      inputType: InputTypes.Text,
      ariaLabel: t('label.phone'),
      disabled: !isUpdatingData,
      label: t('label.phone'),
      name: 'phone',
      type: 'tel',
      className: classNames(classes.inputInternalPosition, {
        [classes.updateInput]: isUpdatingData,
      }),
      rules: {
        required: false,
        validate: phoneValidator,
      },
    },
  ]

  const resetForm = useCallback(() => {
    reset(defaultValues)
    setIsUpdatingData(false)
  }, [defaultValues, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values: InstitutionPostType) => {
      try {
        await updateInstitution(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.institution_updated'),
        })
        resetForm()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [updateInstitution, t, resetForm, setError]
  )

  return (
    <>
      <div className={classes.formContainer}>
        <DynamicForm
          fields={fields}
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          className={classes.form}
          formId="Institution"
        />

        <div className={classes.dateTimeContainer}>
          {workingTimes}
          {vacationDays}
        </div>
      </div>
      <Button
        children={t('button.update')}
        hidden={isUpdatingData}
        onClick={() => setIsUpdatingData(!isUpdatingData)}
        className={classes.formButtons}
        disabled={!includes(userPrivileges, Privileges.EditInstitution)}
      />
      <FormButtons
        isResetDisabled={false}
        isSubmitDisabled={!isValid}
        loading={isSubmitting || isLoading}
        resetForm={resetForm}
        hidden={!isUpdatingData}
        className={classes.formButtons}
        formId="Institution"
        submitButtonName={t('button.save')}
      />
    </>
  )
}

export default InstitutionForm
