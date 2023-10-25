import { FC, useCallback, useEffect } from 'react'
import { useForm, SubmitHandler, FieldPath } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import FormButtons from 'components/organisms/FormButtons/FormButtons'
import { filter, includes, join, map, omit, split } from 'lodash'
import classes from './classes.module.scss'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import { TMType } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { useNavigate } from 'react-router-dom'
import { useCreateTranslationMemory } from 'hooks/requests/useTranslationMemories'

interface FormValues {
  name: string
  slang: string
  tlang: string
  tv_domain?: string
  type: TMType
}

const TranslationMemoryForm: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createTranslationMemory } = useCreateTranslationMemory()

  const { classifierValuesFilters: languageOptions, classifierValues } =
    useClassifierValuesFetch({ type: ClassifierValueType.Language })
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
    defaultValues: { type: TMType.Internal },
  })

  const statusOptions = map(TMType, (status) => ({
    label: t(`translation_memories.status.${status}`),
    value: status,
  }))

  const statusValue = watch('type')

  useEffect(() => {
    if (includes([TMType.Shared, TMType.Public], statusValue)) {
      showModal(ModalTypes.ConfirmationModal, {
        handleCancel: () => setValue('type', TMType.Internal),
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
      name: 'tv_domain',
      options: domainOptions,
      className: classes.inputInternalPosition,
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.source_language'),
      placeholder: t('placeholder.pick'),
      label: `${t('label.source_language')}*`,
      name: 'slang',
      className: classes.inputInternalPosition,
      options: languageOptions,
      multiple: false,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.destination_language'),
      placeholder: t('placeholder.pick'),
      label: `${t('label.destination_language')}*`,
      name: 'tlang',
      className: classes.inputInternalPosition,
      options: languageOptions,
      multiple: false,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.usage'),
      label: t('label.usage'),
      name: 'type',
      options: statusOptions,
      className: classes.inputInternalPosition,
      helperText: t('translation_memories.helper_text'),
    },
  ]

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const slangValue = filter(classifierValues, { id: values.slang })[0].value
      const sortSlang = split(slangValue, '-')[0]
      const tlangValue = filter(classifierValues, { id: values.tlang })[0].value
      const sortTlang = split(tlangValue, '-')[0]

      const payload = {
        ...{ lang_pair: `${sortSlang}_${sortTlang}` },
        ...omit(values, ['slang', 'tlang']),
      }
      try {
        const data = await createTranslationMemory(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memory_created'),
        })
        navigate(`/memories/${data?.tag?.id}`)
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
    [classifierValues, createTranslationMemory, t, navigate, setError]
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
        resetForm={() => reset({})}
        className={classes.formButtons}
        submitButtonName={t('button.create_translation_memory')}
      />
    </DynamicForm>
  )
}

export default TranslationMemoryForm
