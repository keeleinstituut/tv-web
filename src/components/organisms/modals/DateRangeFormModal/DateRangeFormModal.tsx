/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  filter,
  isEqual,
  join,
  map,
  reduce,
  size,
  split,
  toArray,
  toNumber,
  uniqueId,
} from 'lodash'
import { FieldPath, Path, SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import classes from './classes.module.scss'
import { ValidationError } from 'api/errorHandler'

export type EditDataType = {
  id?: string
  institution_id?: string
  institution_user_id?: string
  start?: string
  end?: string
}

export interface DateRangeFormModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  data?: EditDataType[]
  title?: string
  handleOnSubmit?: (
    values: EditDataType[],
    vacationExclusions?: string[]
  ) => void
}

type FormValues = {
  [key in string]: {
    institution_id?: string
    institution_user_id?: string
    id: string
    start: string
    end: string
  }
}

const DateRangeFormModal: FC<DateRangeFormModalProps> = ({
  isModalOpen,
  closeModal,
  data: editableData,
  title,
  handleOnSubmit,
}) => {
  const { t } = useTranslation()

  const defaultValues: FormValues = useMemo(
    () =>
      reduce(
        editableData,
        (result, value) => {
          if (!value.id) {
            return result
          }
          return {
            ...result,
            [value.id]: {
              id: value.id,
              institution_id: value?.institution_id,
              institution_user_id: value?.institution_user_id,
              start: value.start,
              end: value.end,
            },
          }
        },
        {}
      ),

    [editableData]
  )

  const {
    handleSubmit,
    control,
    reset,
    resetField,
    unregister,
    setError,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<FormValues>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: defaultValues,
  })

  const editableFields: FieldProps<FormValues>[] = map(
    editableData,
    ({ id }) => {
      return {
        inputType: InputTypes.DateRange,
        name: `${id}` as Path<FormValues>,
        id: id,
        label: t('institution.vacation_times_range'),
        handleDelete: () => handleOnDelete(String(id)),
        rules: {
          validate: (value) => {
            if (!value?.end || !value?.start) {
              return t('error.required')
            }
          },
        },
      }
    }
  )

  const [inputFields, setInputFields] =
    useState<FieldProps<FormValues>[]>(editableFields)

  const [prevDeletedValue, setPrevDeletedValue] = useState<string>()

  const [vacationExclusions, setVacationExclusions] = useState<string[]>([])

  const addInputField = () => {
    const newId = uniqueId()

    setInputFields([
      ...inputFields,
      {
        inputType: InputTypes.DateRange,
        name: `${newId}` as Path<FormValues>,
        label: t('institution.vacation_times_range'),
        handleDelete: () => handleOnDelete(newId),
        rules: {
          validate: (value) => {
            if (!value?.end || !value?.start) {
              return t('error.required')
            }
          },
        },
      },
    ])
  }

  useEffect(() => {
    setInputFields(editableFields)
    reset(defaultValues)
  }, [editableData])

  useEffect(() => {
    const withoutDeleteFields = filter(inputFields, (field) => {
      const fieldId = split(field.name, '.')[0]
      return !isEqual(fieldId, prevDeletedValue)
    })
    setInputFields(withoutDeleteFields)
    if (
      prevDeletedValue &&
      editableData?.find(
        (value) => value.id === prevDeletedValue && value.institution_id
      )
    ) {
      setVacationExclusions([...vacationExclusions, prevDeletedValue])
    }
    unregister(prevDeletedValue)
  }, [prevDeletedValue])

  const handleOnDelete = (id: string) => {
    setPrevDeletedValue(id)
    setTimeout(() => resetField(id), 100)
  }

  const resetForm = useCallback(() => {
    reset()
    setPrevDeletedValue(undefined)
    setInputFields(editableFields)
  }, [editableFields, inputFields, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const payload = toArray(values).filter((value) => value)
      try {
        if (handleOnSubmit) {
          await handleOnSubmit(payload, vacationExclusions)
        }
        resetForm()
        closeModal()
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as unknown as FieldPath<FormValues>
            const tKey = split(typedKey, '.')[1]
            const errorString = join(errorsArray, ',')

            if (tKey) {
              const userVacations = payload.filter(
                (vacation) => !vacation.institution_id
              )
              const inputName = `${userVacations[toNumber(tKey)].id}`
              setError(inputName, {
                type: 'backend',
                message: errorString,
              })
            }
          })
        }
      }
    },
    [vacationExclusions]
  )

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Medium}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          size: SizeTypes.M,
          onClick: () => {
            resetForm()
            closeModal()
          },
          autoFocus: true,
        },
        {
          appearance: AppearanceTypes.Primary,
          form: 'dateRange',
          children: t('button.save'),
          loading: isSubmitting,
          type: 'submit',
          disabled: !isValid || (!prevDeletedValue && !isDirty),
        },
      ]}
    >
      <DynamicForm
        formId="dateRange"
        fields={inputFields}
        control={control}
        className={classes.formContainer}
        onSubmit={handleSubmit(onSubmit)}
      />
      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('tag.add_new_row')}
        onClick={addInputField}
        form="dateRange"
        hidden={size(inputFields) > 6}
      />
    </ModalBase>
  )
}

export default DateRangeFormModal
