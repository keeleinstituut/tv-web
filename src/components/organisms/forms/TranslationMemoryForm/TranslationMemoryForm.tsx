import { FC, useCallback, useEffect } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import { join, map, startsWith } from 'lodash'
import classes from './classes.module.scss'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { TranslationMemoryStatus } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { useNavigate } from 'react-router-dom'

interface FormValues {
  name: string
  source_language: string[]
  destination_language: string[]
  translation_domain?: string
  status: TranslationMemoryStatus
}

const TranslationMemoryForm: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { classifierValuesFilters: languageOptions } = useClassifierValuesFetch(
    { type: ClassifierValueType.Language }
  )
  const { classifierValuesFilters: domainOptions } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, isValid },
    setError,
    watch,
    setValue,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: { status: TranslationMemoryStatus.Internal },
  })

  const statusOptions = map(TranslationMemoryStatus, (status) => ({
    label: t(`translation_memories.status.${status}`),
    value: status,
  }))

  const statusValue = watch('status')

  useEffect(() => {
    if (statusValue !== TranslationMemoryStatus.Internal) {
      showModal(ModalTypes.ConfirmationModal, {
        handleCancel: () =>
          setValue('status', TranslationMemoryStatus.Internal),
        title: t('translation_memories.confirmation_text'),
        cancelButtonContent: t('button.cancel'),
        helperText: t('translation_memories.confirmation_help_text'),
      })
    }
  }, [setValue, statusValue, t])

  const fields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('translation_memories.memory_name'),
      placeholder: t('placeholder.write_here'),
      label: `${t('translation_memories.memory_name')}*`,
      name: 'name',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.translation_domain'),
      placeholder: t('placeholder.pick'),
      label: t('label.translation_domain'),
      name: 'translation_domain',
      options: domainOptions,
      className: classes.inputInternalPosition,
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.source_language'),
      placeholder: t('placeholder.pick'),
      label: `${t('label.source_language')}*`,
      name: 'source_language',
      className: classes.inputInternalPosition,
      options: languageOptions,
      multiple: true,
      buttons: true,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.destination_language'),
      placeholder: t('placeholder.pick'),
      label: `${t('label.destination_language')}*`,
      name: 'destination_language',
      className: classes.inputInternalPosition,
      options: languageOptions,
      multiple: true,
      buttons: true,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.usage'),
      label: t('label.usage'),
      name: 'status',
      options: statusOptions,
      className: classes.inputInternalPosition,
      helperText: t('translation_memories.helper_text'),
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      console.log(values)

      //TODO add endpoint for creating a translation memory

      try {
        // const { id } = await createOrder(payload)
        const id = '99c8bbac-b9bf-4b3b-835a-bc0865ea2168'
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memory_created'),
        })
        navigate(`/memories/${id}`)
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
    [t, navigate, setError]
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
        resetForm={reset}
        className={classes.formButtons}
        submitButtonName={t('button.create_translation_memory')}
      />
    </DynamicForm>
  )
}

export default TranslationMemoryForm
