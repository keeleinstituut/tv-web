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
import { TMType, TranslationMemoryType } from 'types/translationMemories'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
//TODO: add segments import icons
// import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
// import { ReactComponent as SuccessIcon } from 'assets/icons/success.svg'
// import { ReactComponent as ErrorIcon } from 'assets/icons/error_outline.svg'
import { useInstitutionFetch } from 'hooks/requests/useInstitutions'
import dayjs from 'dayjs'
import { useUpdateTranslationMemory } from 'hooks/requests/useTranslationMemories'
import classNames from 'classnames'

interface FormValues {
  name: string
  tv_domain?: string
  type: TMType
  tv_tags: string[]
  comment: string
}
type TranslationMemoryEditFormTypes = {
  data: Partial<TranslationMemoryType>
  isTmOwnedByUserInstitution?: boolean
}

type DetailsTypes = {
  id: string
  language_direction: string
  chunk_amount?: string | number
  owner: string
  created_at: string
}

const TranslationMemoryEditForm: FC<TranslationMemoryEditFormTypes> = ({
  data,
  isTmOwnedByUserInstitution,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { institution } = useInstitutionFetch({ id: data?.institution_id })
  const { updateTranslationMemory } = useUpdateTranslationMemory({
    id: data.id,
  })
  const { classifierValuesFilters: domainOptions } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })
  const { tagsFilters: tagOptions } = useFetchTags({
    type: TagTypes.TranslationMemories,
  })

  const date = dayjs(data?.created_at, 'YYYYMMDDTHHmmssZ')

  const details = useMemo(
    () => ({
      id: data?.id || '',
      language_direction: data?.lang_pair || '',
      chunk_amount: data.chunk_amount || 0,
      owner: institution?.name || '',
      created_at: dayjs(date).format('DD.MM.YYYY') || '',
    }),
    [data, institution, date]
  )

  const defaultValues = useMemo(
    () => ({
      name: data.name || '',
      type: data?.type || TMType.Internal,
      tv_domain: data?.tv_domain || '',
      tv_tags: data?.tv_tags || [],
      comment: data?.comment || '',
    }),
    [data]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
    setError,
  } = useForm<FormValues>({
    mode: 'onChange',
    values: defaultValues,
  })

  const statusOptions = map(TMType, (status) => ({
    label: t(`translation_memories.status.${status}`),
    value: status,
  }))

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
      disabled: !isTmOwnedByUserInstitution,
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.tags'),
      placeholder: t('placeholder.select_tags'),
      label: `${t('label.tags')}`,
      name: 'tv_tags',
      className: classes.inputInternalPosition,
      options: tagOptions,
      multiple: true,
      buttons: true,
      disabled:
        !includes(userPrivileges, Privileges.AddTag) ||
        !includes(userPrivileges, Privileges.EditTag) ||
        !isTmOwnedByUserInstitution,
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.usage'),
      label: t('label.usage'),
      name: 'type',
      options: statusOptions,
      className: classes.inputInternalPosition,
      rules: {
        required: true,
      },
      helperText: t('translation_memories.helper_text'),
      disabled: !isTmOwnedByUserInstitution,
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
      disabled: !isTmOwnedByUserInstitution,
    },
    {
      inputType: InputTypes.Selections,
      ariaLabel: t('label.translation_domain'),
      placeholder: t('placeholder.pick'),
      label: t('label.translation_domain'),
      name: 'tv_domain',
      options: domainOptions,
      className: classes.inputInternalPosition,
      disabled: !isTmOwnedByUserInstitution,
    },
  ]

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      try {
        await updateTranslationMemory(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.translation_memory_updated'),
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
    [updateTranslationMemory, t, resetForm, setError]
  )

  return (
    <>
      <div className={classes.detailsContainer}>
        <div className={classes.memoryDetails}>
          {map(
            details,
            (value: keyof DetailsTypes, key: keyof DetailsTypes) => (
              <DetailsRow
                label={t(`label.${key}`)}
                key={key}
                labelClass={classes.labelClass}
                valueClass={
                  key === 'language_direction'
                    ? classes.tag
                    : classes.valueClass
                }
                value={value}
              />
            )
          )}
          <div
            className={classNames(
              classes.memoryDetails,
              classes.grayColor,
              !data?.chunk_amount && classes.hidden
            )}
          >
            <span className={classes.labelClass}>
              {t('label.last_imported')}
            </span>
            <span>xxxx</span>
            {/* Note: importing and segments info coming later */}
            {/* <SmallTooltip
            tooltipContent={'Viga viga'}
            icon={ErrorIcon}
            // hidden={}
            //className={classNames(classes.bar, isVacation && classes.vacation)}
            contentClassName={classes.content}
          /> */}
            <span className={classes.labelClass}>
              {t('label.chunk_amount_old')}
            </span>
            <span>xxxx</span>
          </div>
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
        isResetDisabled={!isDirty}
        isSubmitDisabled={
          !isDirty ||
          !isValid ||
          !includes(userPrivileges, Privileges.EditTmMetadata) ||
          !includes(userPrivileges, Privileges.EditTm)
        }
        loading={isSubmitting}
        resetForm={resetForm}
        className={classes.formButtons}
        formId="TranslationMemory"
        submitButtonName={t('button.save')}
      />
    </>
  )
}

export default TranslationMemoryEditForm
