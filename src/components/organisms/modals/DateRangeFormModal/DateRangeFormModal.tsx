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
import { filter, isEqual, map, size, split, uniqueId } from 'lodash'
import {
  FieldPath,
  Path,
  SubmitHandler,
  useController,
  useForm,
} from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import classes from './classes.module.scss'
import { ValidationError } from 'api/errorHandler'
import useValidators from 'hooks/useValidators'

export interface DateRangeType {
  start_date: string
  end_date: string
}
export type EditDataType = {
  id?: string
  days?: string[]
  date_range?: DateRangeType
}

export interface DateRangeFormModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  data?: EditDataType[]
  title?: string
  handleOnSubmit?: (values: EditDataType[]) => void
}

type FormValues = {
  [key in string]: DateRangeType
}

const DateRangeFormModal: FC<DateRangeFormModalProps> = ({
  isModalOpen,
  closeModal,
  data: editableData,
  title,
  handleOnSubmit,
}) => {
  const { t } = useTranslation()
  const { dateTimeRequiredValidator } = useValidators()

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
    defaultValues: {},
  })

  const editableFields: FieldProps<FormValues>[] = map(
    editableData,
    ({ id }) => {
      return {
        inputType: InputTypes.DateRange,
        name: `${id}` as Path<FormValues>,
        id: id,
        label: t('institution.vacation_times_range'),
        formControl: control,
        // handleDelete
        rules: {
          required: true,
          //   validate,
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
        inputType: InputTypes.DateRange,
        name: `${newId}` as Path<FormValues>,
        label: t('institution.vacation_times_range'),
        // formControl: control,
        // handleDelete: () => handleOnDelete(newId),
        // rules: {
        //   required: true,
        //   validate,
        // },
      },
    ]
    setInputFields(newFields)
  }

  useEffect(() => {
    setInputFields(editableFields)
    // reset(defaultValues)
  }, [editableData])

  useEffect(() => {
    const withoutDeleteFields = filter(inputFields, (field) => {
      const fieldId = split(field.name, '.')[0]
      return !isEqual(fieldId, prevDeletedValue)
    })
    setInputFields(withoutDeleteFields)
    // unregister(prevDeletedValue)
  }, [prevDeletedValue])

  const resetForm = useCallback(() => {
    reset()
    setPrevDeletedValue(undefined)
    setInputFields(editableFields)
  }, [editableFields, inputFields, reset])

  const onSubmit: SubmitHandler<any> = useCallback(async (values) => {
    const payload = values

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
