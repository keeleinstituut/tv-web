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
  compact,
  filter,
  includes,
  isEqual,
  join,
  map,
  reduce,
  size,
  split,
  toArray,
  uniqueId,
} from 'lodash'
import { FieldPath, Path, SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import classes from './classes.module.scss'
import { ValidationError } from 'api/errorHandler'
import useValidators from 'hooks/useValidators'

export interface TimeRangeType {
  start: string
  end: string
}
export type EditDataType = {
  id?: string
  days?: string[]
  time_range?: TimeRangeType
}

export interface DateTimeRangeFormModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  data?: EditDataType[]
  title?: string
  handleOnSubmit?: (values: EditDataType[]) => void
}

type FormValues = {
  [key in string]: {
    days: string[]
    time_range: TimeRangeType
  }
}

const DateTimeRangeFormModal: FC<DateTimeRangeFormModalProps> = ({
  isModalOpen,
  closeModal,
  data: editableData,
  title,
  handleOnSubmit,
}) => {
  const { t } = useTranslation()
  const { dateTimeRequiredValidator } = useValidators()

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
            [value.id]: value,
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
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: defaultValues,
  })

  const editableFields: FieldProps<FormValues>[] = map(
    editableData,
    ({ id }) => {
      return {
        inputType: InputTypes.DayTimeRange,
        name: `${id}` as Path<FormValues>,
        id: id,
        formControl: control,
        handleDelete: () => handleOnDelete(String(id)),
        rules: {
          required: true,
          validate: dateTimeRequiredValidator,
        },
      }
    }
  )

  const [inputFields, setInputFields] =
    useState<FieldProps<FormValues>[]>(editableFields)

  const [prevDeletedValue, setPrevDeletedValue] = useState<string>()

  const addInputField = () => {
    const newId = uniqueId()
    const newFields: FieldProps<FormValues>[] = [
      ...inputFields,
      {
        inputType: InputTypes.DayTimeRange,
        name: `${newId}` as Path<FormValues>,
        formControl: control,
        handleDelete: () => handleOnDelete(newId),
        rules: {
          required: true,
          validate: dateTimeRequiredValidator,
        },
      },
    ]
    setInputFields(newFields)
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

  const onSubmit: SubmitHandler<FormValues> = useCallback(async (values) => {
    const payload = toArray(values).filter((value) => value)
    try {
      if (handleOnSubmit) {
        await handleOnSubmit(payload)
      }
      resetForm()
      closeModal()
    } catch (errorData) {
      const typedErrorData = errorData as ValidationError
      if (typedErrorData.errors) {
        map(typedErrorData.errors, (errorsArray, key) => {
          const typedKey = key as unknown as FieldPath<FormValues>

          const filedId = compact(
            map(values, ({ days }, index) => {
              const day = split(typedKey, '_')[0]
              if (includes(days, day)) {
                return index
              }
            })
          )[0]

          const errorString = join(errorsArray, ',')
          setError(filedId, { type: 'backend', message: errorString })
        })
      }
    }
  }, [])

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
        },
        {
          appearance: AppearanceTypes.Primary,
          form: 'dateTimeRange',
          children: t('button.save'),
          loading: isSubmitting,
          type: 'submit',
          disabled:
            !isValid ||
            (!prevDeletedValue && !isDirty) ||
            !(editableFields.length === inputFields.length),
        },
      ]}
    >
      <DynamicForm
        formId="dateTimeRange"
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
        form="dateTimeRange"
        hidden={size(inputFields) > 6}
      />
    </ModalBase>
  )
}

export default DateTimeRangeFormModal
