import { FC, useCallback, useMemo } from 'react'
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
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'
import DetailsRow from 'components/atoms/DetailsRow/DetailsRow'
import { TranslationMemoryStatus } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'

interface FormValues {
  name: string
  translation_domain?: string
  status: TranslationMemoryStatus
  tags: string[]
  comment: string
}

type TranslationMemoryEditFormTypes = {
  data: object
}

const TranslationMemoryEditForm: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

  const { classifierValuesFilters: domainOptions } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })
  // const { tagsFilters: tagOptions } = useFetchTags({
  //   type: TagTypes.TranslationMemories,
  // })
  const { tags: allTags = [] } = useFetchTags({ type: TagTypes.Vendor })

  const defaultValues = useMemo(
    () => ({
      name: 'TõlkeMälu nimi',
      status: TranslationMemoryStatus.Internal,
      translation_domain: 'e5d8c11c-0923-470a-b289-36752d0246d0',
      tags: ['99ef74ee-6eb1-47f3-8027-390d6914789b'],
      comment: '',
    }),
    []
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
    setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    values: defaultValues,
  })

  const statusOptions = map(TranslationMemoryStatus, (status) => ({
    label: t(`translation_memories.status.${status}`),
    value: status,
  }))
  const tagOptions = map(allTags, ({ name, id }) => {
    return {
      label: name || '',
      value: id || '',
    }
  })

  const fields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('translation_memories.memory_name'),
      placeholder: t('placeholder.write_here'),
      label: t('label.name'),
      name: 'name',
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.tags'),
      placeholder: t('placeholder.select_tags'),
      label: `${t('label.tags')}`,
      name: 'tags',
      className: classes.inputInternalPosition,
      options: tagOptions,
      multiple: true,
      buttons: true,
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
    {
      inputType: InputTypes.Text,
      isTextarea: true,
      ariaLabel: t('label.comment'),
      placeholder: t('placeholder.write_here'),
      label: `${t('label.comment')}`,
      name: 'comment',
      type: 'comment',
      className: classes.inputInternalPosition,
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
  ]

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      console.log('vakus', values)
      try {
        // await updateInstitution(values)
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
    [t, resetForm, setError]
  )
  const data = {
    id: '1244',
    language_direction: 'et-EE >en-GB',
    chunk_amount: '1923',
    owner: 'SG',
    created_time: 'dd.mm.yyyy',
    last_imported: 'dd.m.yyyy.hh.mm',
    chunk_amount_old: 'xxxxx',
  }

  return (
    <>
      <div className={classes.detailsContainer}>
        <div className={classes.memoryDetails}>
          {map(data, (value, key) => (
            <DetailsRow
              //label={t(`label.${key}`)}
              label={key}
              key={key}
              hidden={!value}
              labelClass={classes.labelClass}
              valueClass={
                key === 'language_direction' ? classes.tag : classes.valueClass
              }
              value={value}
            />
          ))}
        </div>
        <DynamicForm
          fields={fields}
          control={control}
          onSubmit={handleSubmit(onSubmit)}
          className={classes.form}
          formId="TranslationMemory"
        />
      </div>
      <FormButtons
        isResetDisabled={false}
        isSubmitDisabled={!isValid}
        loading={isSubmitting}
        resetForm={resetForm}
        // hidden={!isUpdatingData}
        className={classes.formButtons}
        formId="TranslationMemory"
        submitButtonName={t('button.save')}
      />
    </>
  )
}

export default TranslationMemoryEditForm
